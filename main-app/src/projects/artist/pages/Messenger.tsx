import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// 👇 Ensure this path is correct
import { translateMessage } from "@/projects/artist/lib/translation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  MessageCircle, Send, Search, Loader2, User, Globe
} from "lucide-react"

const LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'en', name: 'English' }
]

export default function Messenger() {
  const [conversations, setConversations] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [myLang, setMyLang] = useState<string>("en") 
  const [showLangModal, setShowLangModal] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Init
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()

        if (profile?.language) {
          setMyLang(profile.language)
          fetchConversations(user.id)
        } else {
          setShowLangModal(true)
          setLoading(false)
        }
      }
    }
    init()
  }, [])

  // 2. Language Selection
  const handleSelectLanguage = async (code: string) => {
    if (!userId) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ language: code }).eq('id', userId)
    if (!error) {
      setMyLang(code)
      setShowLangModal(false)
      fetchConversations(userId)
    }
    setLoading(false)
  }

  // 3. Fetch Conversations
  const fetchConversations = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, last_message, updated_at,
        p1:participant1_id(full_name, id, language),
        p2:participant2_id(full_name, id, language)
      `)
      .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
      .order('updated_at', { ascending: false })

    if (data) {
      const formatted = data.map((c: any) => {
        const otherUser = c.p1.id === uid ? c.p2 : c.p1
        return { ...c, otherUser }
      })
      setConversations(formatted)
    }
    setLoading(false)
  }

  // 4. 🔥 AUTO-TRANSLATE HELPER (Updated)
  const processIncomingMessage = async (msg: any) => {
    // If message is NOT from me, and I don't use English
    if (msg.sender_id !== userId && myLang !== 'en') {
        // 👇 FIX: Always translate to 'myLang', ignoring DB content. 
        // This ensures if you switch to Tamil, you SEE Tamil.
        const translated = await translateMessage(msg.content, 'en', myLang)
        return { ...msg, translated_content: translated }
    }
    return msg
  }

  // 5. Load Chat & Realtime
  useEffect(() => {
    if (!activeChat || !userId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true })

      if (data) {
        // Show raw data instantly
        setMessages(data)
        // Process translations in background and update
        const processed = await Promise.all(data.map(m => processIncomingMessage(m)))
        setMessages(processed)
      }
    }
    fetchMessages()

    const channel = supabase
      .channel(`artist_chat:${activeChat.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChat.id}` },
        async (payload) => {
          const newMsg = payload.new
          
          // 1. Add immediately (dedupe)
          setMessages((prev) => {
             if (prev.some(m => m.id === newMsg.id)) return prev;
             return [...prev, newMsg];
          })

          // 2. Translate if incoming
          if (newMsg.sender_id !== userId) {
            const translatedMsg = await processIncomingMessage(newMsg)
            setMessages((prev) => prev.map(m => m.id === translatedMsg.id ? translatedMsg : m))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChat, userId, myLang]) // 👈 Re-runs when myLang changes to Tamil

  // 6. Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeChat) return
    const textToSend = newMessage
    setNewMessage("")

    // Outgoing: Tamil -> English
    const translatedText = await translateMessage(textToSend, myLang, 'en')

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChat.id,
        sender_id: userId,
        content: textToSend,
        translated_content: translatedText
      })
      .select()
      .single()

    if (!error && newMsg) {
      setMessages((prev) => [...prev, newMsg])
      fetchConversations(userId)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-8 h-8" /></div>

  if (showLangModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4"><Globe className="w-6 h-6 text-purple-600" /></div>
            <CardTitle className="text-xl">Select Your Language</CardTitle>
            <p className="text-sm text-slate-500">We will translate chats for you.</p>
          </CardHeader>
          <div className="p-6 grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <Button key={lang.code} variant="outline" className="h-14 justify-start px-4" onClick={() => handleSelectLanguage(lang.code)}>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">{lang.name.split(' ')[0]}</span>
                  <span className="text-xs text-slate-400 font-normal">{lang.name.split(' ')[1] || 'Language'}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in p-6">
      <Card className="w-80 border-slate-200 flex flex-col shadow-sm">
        <CardHeader className="pb-3 border-b space-y-3">
          <CardTitle className="flex items-center gap-2 text-slate-800"><MessageCircle className="w-5 h-5" /> Messages</CardTitle>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><Input placeholder="Search..." className="pl-10 h-9 bg-slate-50" /></div>
        </CardHeader>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div key={c.id} onClick={() => setActiveChat(c)} className={`p-4 cursor-pointer border-b hover:bg-slate-50 ${activeChat?.id === c.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                <div><div className="font-medium text-sm text-slate-900">{c.otherUser?.full_name}</div><div className="text-xs text-slate-500 truncate">{c.last_message || "Start chatting..."}</div></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex-1 border-slate-200 flex flex-col shadow-sm">
        {activeChat ? (
          <>
            <div className="p-4 border-b flex justify-between bg-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex justify-center items-center font-bold">{activeChat.otherUser?.full_name?.[0]}</div>
                <div><h3 className="font-medium text-slate-900">{activeChat.otherUser?.full_name}</h3><div className="text-xs text-green-600">● Online</div></div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                      <p>{isMe ? msg.content : (msg.translated_content || msg.content)}</p>
                      {!isMe && msg.translated_content && msg.translated_content !== msg.content && (
                        <p className="text-[10px] opacity-60 mt-1 pt-1 border-t border-slate-200/50 italic">Original: {msg.content}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t rounded-b-xl">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Type in ${LANGUAGES.find(l => l.code === myLang)?.name.split(' ')[0] || 'your language'}...`} className="flex-1" />
                <Button type="submit" className="bg-purple-600"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a chat to start</div>
        )}
      </Card>
    </div>
  )
}