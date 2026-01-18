import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { translateMessage } from "@/projects/artist/lib/translation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  MessageCircle, Send, Search, Phone, Video, MoreVertical, Loader2, ArrowLeft
} from "lucide-react"

export default function UserMessenger() {
  const [searchParams] = useSearchParams()
  const initialChatId = searchParams.get('chat')

  const [conversations, setConversations] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        await fetchConversations(user.id)
      }
    }
    init()
  }, [])

  // Auto-select chat from URL
  useEffect(() => {
    if (initialChatId && conversations.length > 0 && !activeChat) {
      const targetChat = conversations.find(c => c.id === initialChatId)
      if (targetChat) loadChat(targetChat)
    }
  }, [initialChatId, conversations])

  const fetchConversations = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, last_message, updated_at,
        p1:participant1_id(full_name, id, language, avatar_url),
        p2:participant2_id(full_name, id, language, avatar_url)
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

  const loadChat = async (chat: any) => {
    setActiveChat(chat)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', chat.id)
      .order('created_at', { ascending: true })

    setMessages(data || [])

    const channel = supabase
      .channel(`chat:${chat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${chat.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new]))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeChat) return

    // 1. Get Artisan's Language (Default to 'hi' if unknown)
    const artisanLang = activeChat.otherUser?.language || 'hi';

    // 2. FIX: Explicitly send "English" -> "Artisan Lang"
    const translatedText = await translateMessage(newMessage, 'en', artisanLang)

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeChat.id,
      sender_id: userId,
      content: newMessage, // English
      translated_content: translatedText // Hindi/Marathi/etc.
    })

    if (!error) {
      setNewMessage("")
      setConversations(prev => prev.map(c =>
        c.id === activeChat.id ? { ...c, last_message: newMessage, updated_at: new Date() } : c
      ))
    }
  }
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-orange-600" /></div>

  return (
    <div className="min-h-screen bg-orange-50/30 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 flex h-[75vh]">

          {/* SIDEBAR */}
          <div className={`w-full md:w-80 border-r border-slate-100 bg-white flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-600" /> Messages
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No conversations yet.<br />Contact an artisan to start!</div>
              ) : conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => loadChat(c)}
                  className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors border-b border-slate-50 relative ${activeChat?.id === c.id ? 'bg-orange-50 border-r-4 border-r-orange-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {c.otherUser.full_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-900 truncate">{c.otherUser.full_name}</h3>
                        <span className="text-[10px] text-slate-400">{new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{c.last_message || 'Start chatting...'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className={`flex-1 flex flex-col bg-[#FDFBF7] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChat(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {activeChat.otherUser.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{activeChat.otherUser.full_name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-slate-500">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === userId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] md:max-w-[60%] p-3 rounded-2xl text-sm shadow-sm relative group ${isMe
                          ? 'bg-orange-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                          }`}>
                          {/* Message Content */}
                          <div className="leading-relaxed">
                            {/* Show what the SENDER typed. Receiver sees translation. */}
                            {isMe ? msg.content : (msg.translated_content || msg.content)}
                          </div>

                          {/* Original Text (Subtle) */}
                          {!isMe && msg.translated_content && msg.translated_content !== msg.content && (
                            <div className="mt-1 pt-1 border-t border-slate-100/50 text-[10px] opacity-60 italic">
                              Original: {msg.content}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-orange-100' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex items-center gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-4"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim()}
                      className="rounded-full w-10 h-10 bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}