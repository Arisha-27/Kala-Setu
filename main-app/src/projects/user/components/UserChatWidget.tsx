import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// 👇 Ensure this path matches your project structure
import { translateMessage } from "@/projects/artist/lib/translation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle, X, Minus, Maximize2, Send, Loader2
} from "lucide-react"

export function UserChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Initialize
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        fetchConversations(data.user.id)
      }
    })

    const handleOpenChat = async (event: any) => {
      const { artisanId, chatId } = event.detail
      if (!artisanId) return

      setIsOpen(true)
      setIsMinimized(false)

      if (chatId) {
        const { data: chatData } = await supabase
          .from('conversations')
          .select(`*, p1:participant1_id(full_name, id), p2:participant2_id(full_name, id)`)
          .eq('id', chatId)
          .single()

        if (chatData) {
          const { data: me } = await supabase.auth.getUser()
          const otherUser = chatData.p1.id === me.user?.id ? chatData.p2 : chatData.p1
          setActiveChat({ ...chatData, otherUser })
        }
      }
    }

    window.addEventListener('OPEN_CHAT', handleOpenChat)
    return () => window.removeEventListener('OPEN_CHAT', handleOpenChat)
  }, [])

  // 2. Fetch Conversations
  const fetchConversations = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, last_message, updated_at,
        p1:participant1_id(full_name, id),
        p2:participant2_id(full_name, id)
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
  }

  // 3. 🔥 ROBUST REALTIME & TRANSLATION
  useEffect(() => {
    if (!activeChat || !userId) return

    // Load History
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }
    fetchMessages()

    // Subscribe to NEW messages
    const channel = supabase
      .channel(`widget_chat:${activeChat.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeChat.id}`
        },
        async (payload) => {
          const newMsg = payload.new

          // 1. Add to state immediately to update UI (Fixes "refresh needed" issue)
          setMessages((prev) => {
            // Deduplicate: Don't add if we already have it
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // 2. If message is from Artisan (not me), translate it
          if (newMsg.sender_id !== userId) {
            // Translate async and update the specific message
            const translatedText = await translateMessage(newMsg.content, 'hi', 'en')

            setMessages((prev) =>
              prev.map(m =>
                m.id === newMsg.id ? { ...m, translated_content: translatedText } : m
              )
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChat, userId])

  // 4. Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeChat) return
    const text = newMessage
    setNewMessage("")

    // Translate User's English -> Hindi
    const translatedText = await translateMessage(text, 'en', 'hi')

    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChat.id,
        sender_id: userId,
        content: text,
        translated_content: translatedText
      })
      .select()
      .single()

    if (!error && newMsg) {
      setMessages(prev => [...prev, newMsg])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  // --- RENDER ---
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-2xl z-50 transition-transform hover:scale-110 border-4 border-white"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </Button>
    )
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl z-50 border-orange-100">
        <div className="p-4 bg-orange-600 text-white flex justify-between items-center rounded-t-lg cursor-pointer" onClick={() => setIsMinimized(false)}>
          <span className="font-semibold flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5" />
            {activeChat ? activeChat.otherUser?.full_name : "Messaging"}
          </span>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-orange-500 text-white" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-orange-500 text-white" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] h-[700px] bg-white shadow-2xl z-50 flex flex-col border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          {activeChat && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-100 hover:text-white hover:bg-orange-500/50 rounded-full mr-1" onClick={() => setActiveChat(null)}>←</Button>
          )}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg leading-tight">
              {activeChat ? activeChat.otherUser?.full_name : "Messages"}
            </h3>
            {activeChat && <span className="text-xs text-orange-100 opacity-90">● Online</span>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-500 text-white rounded-full" onClick={() => setIsMinimized(true)}><Minus className="w-5 h-5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-500 text-white rounded-full" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ea580c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        {!activeChat ? (
          <ScrollArea className="flex-1 p-2 z-10">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
                <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                No conversations yet.
              </div>
            ) : (
              conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveChat(c)}
                  className="flex items-center gap-4 p-4 hover:bg-white hover:shadow-md rounded-xl cursor-pointer transition-all border border-transparent hover:border-orange-100 mb-2 group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {c.otherUser?.full_name?.[0]}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="font-semibold text-slate-800 text-base">{c.otherUser?.full_name}</div>
                    <div className="text-sm text-slate-500 truncate group-hover:text-orange-600/80 transition-colors">
                      {c.last_message || "Start chatting..."}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1 p-5 z-10">
              <div className="space-y-6">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm relative ${isMe ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                        <p className="leading-relaxed text-base">{isMe ? msg.content : (msg.translated_content || msg.content)}</p>
                        {!isMe && msg.translated_content && (
                          <p className="text-[11px] opacity-50 mt-2 border-t border-slate-100 pt-1 font-medium">
                            Original: {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t shrink-0 z-20">
              <form
                className="flex gap-3"
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-12 rounded-full px-5 bg-slate-50 focus-visible:ring-orange-500 border-slate-200"
                />
                <Button type="submit" size="icon" className="bg-orange-600 hover:bg-orange-700 w-12 h-12 rounded-full shadow-lg shadow-orange-200">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}