'use client'
// FILE: components/MessagingUI.tsx

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Send, Search, X, ArrowLeft,
  MessageSquare, CheckCheck, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Conversation {
  id: string
  seeker_id: string
  consultant_id: string
  last_message: string | null
  last_message_at: string
  seeker_unread: number
  consultant_unread: number
  other_user?: {
    id: string
    name: string
    avatar: string | null
    role: string
    city?: string
  }
}

interface Props {
  currentUserId: string
  currentUserRole: 'seeker' | 'consultant'
  initialConsultantId?: string
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function MessagingUI({ currentUserId, currentUserRole, initialConsultantId }: Props) {
  const [conversations, setConversations]   = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv]     = useState<Conversation | null>(null)
  const [messages, setMessages]             = useState<Message[]>([])
  const [newMessage, setNewMessage]         = useState('')
  const [sending, setSending]               = useState(false)
  const [loadingConvs, setLoadingConvs]     = useState(true)
  const [loadingMsgs, setLoadingMsgs]       = useState(false)
  const [searchQuery, setSearchQuery]       = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [initDone, setInitDone]             = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const supabase       = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Helper: fetch profile for a given userId ────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, full_name, avatar_url, role, city')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) console.error('[MessagingUI] fetchProfile failed:', error)
    return data
  }, [])
  // ── Load conversations ──────────────────────────────────────────────────
  // ✅ FIX 1: try/catch/finally ensures setLoadingConvs(false) ALWAYS runs,
  //    preventing the sidebar from being stuck in skeleton forever.
  const loadConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`seeker_id.eq.${currentUserId},consultant_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      if (!data) return

      const enriched = await Promise.all(data.map(async (conv) => {
        const otherId = currentUserRole === 'seeker' ? conv.consultant_id : conv.seeker_id
        const profile = await fetchProfile(otherId)
        return {
          ...conv,
          other_user: profile ? {
            id: otherId,
            name: profile.display_name || profile.full_name || 'User',
            avatar: profile.avatar_url || null,
            role: profile.role,
            city: profile.city,
          } : undefined,
        }
      }))

      setConversations(enriched)
    } catch (err) {
      console.error('[MessagingUI] loadConversations failed:', err)
    } finally {
      setLoadingConvs(false) // ← ALWAYS runs — no more infinite skeleton
    }
  }, [currentUserId, currentUserRole, fetchProfile])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // ── Auto-open conversation with initialConsultantId ─────────────────────
  // ✅ FIX 2: Runs immediately on mount — does NOT wait for loadingConvs.
  //    Queries Supabase directly so it works even if loadConversations fails.
  useEffect(() => {
    if (!initialConsultantId || initDone) return
    setInitDone(true)

   const autoOpen = async () => {
      console.log('[DEBUG] autoOpen started, initialConsultantId:', initialConsultantId, 'currentUserId:', currentUserId)
      try {
        // Check if conversation already exists (direct DB query, no list dependency)
        const { data: existing, error: existingErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('seeker_id', currentUserId)
          .eq('consultant_id', initialConsultantId)
          .maybeSingle()
      console.log('[DEBUG] existing query result:', existing, 'error:', existingErr)
      
      if (existing) {
          const profile = await fetchProfile(initialConsultantId)
          const enriched: Conversation = {
            ...existing,
            other_user: profile ? {
              id: initialConsultantId,
              name: profile.display_name || profile.full_name || 'Consultant',
              avatar: profile.avatar_url || null,
              role: profile.role,
              city: profile.city,
            } : undefined,
          }
          setSelectedConv(enriched)
          setShowMobileChat(true)
          return
        }

        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            seeker_id: currentUserId,
            consultant_id: initialConsultantId,
            last_message: null,
            last_message_at: new Date().toISOString(),
            seeker_unread: 0,
            consultant_unread: 0,
          })
          .select()
          .single()

        if (error || !newConv) {
          console.error('[MessagingUI] Failed to create conversation:', error)
          return
        }

        const profile = await fetchProfile(initialConsultantId)
        const enrichedConv: Conversation = {
          ...newConv,
          other_user: profile ? {
            id: initialConsultantId,
            name: profile.display_name || profile.full_name || 'Consultant',
            avatar: profile.avatar_url || null,
            role: profile.role,
            city: profile.city,
          } : undefined,
        }

        setConversations(prev => [enrichedConv, ...prev])
        setSelectedConv(enrichedConv)
        setShowMobileChat(true)
      } catch (err) {
        console.error('[MessagingUI] autoOpen failed:', err)
      }
    }

    autoOpen()
  }, [initialConsultantId]) // ← NOT gated on loadingConvs or conversations array

  // ── Load messages ───────────────────────────────────────────────────────
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      setMessages(data || [])

      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', currentUserId)

      const field = currentUserRole === 'seeker' ? 'seeker_unread' : 'consultant_unread'
      await supabase.from('conversations').update({ [field]: 0 }).eq('id', convId)
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, [field]: 0 } : c))
    } catch (err) {
      console.error('[MessagingUI] loadMessages failed:', err)
    } finally {
      setLoadingMsgs(false)
    }
  }, [currentUserId, currentUserRole])

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id)
  }, [selectedConv?.id])

  useEffect(() => { scrollToBottom() }, [messages])

  // ── Real-time: new messages in open conversation ─────────────────────────
  useEffect(() => {
    if (!selectedConv) return
    const channel = supabase
      .channel(`messages:${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        if (newMsg.sender_id !== currentUserId) {
          supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedConv?.id, currentUserId])

  // ── Real-time: conversation list updates ────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`conversations:${currentUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => { loadConversations() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConv.id,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: selectedConv.id, sender_id: currentUserId, content })
      .select().single()

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m))
      setConversations(prev => prev.map(c =>
        c.id === selectedConv.id
          ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
          : c
      ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()))
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      setNewMessage(content)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv)
    setShowMobileChat(true)
  }

  const filteredConvs = conversations.filter(c =>
    !searchQuery || c.other_user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, c) =>
    sum + (currentUserRole === 'seeker' ? c.seeker_unread : c.consultant_unread), 0
  )

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-130px)] bg-white rounded-2xl border border-gray-100 overflow-hidden">

      {/* ── Conversations Sidebar ── */}
      <div className={`w-full lg:w-80 shrink-0 flex flex-col border-r border-gray-100 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-navy text-base">
              Messages
              {totalUnread > 0 && (
                <span className="ml-2 font-body text-xs bg-gold text-white font-bold px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="font-body text-sm w-full outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}><X size={13} className="text-gray-400" /></button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="space-y-3 p-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredConvs.map(conv => {
                const unread = currentUserRole === 'seeker' ? conv.seeker_unread : conv.consultant_unread
                const isSelected = selectedConv?.id === conv.id
                return (
                  <button key={conv.id} onClick={() => handleSelectConv(conv)}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-all duration-150 ${
                      isSelected ? 'bg-navy-light border-l-2 border-navy' : 'hover:bg-gray-50'
                    }`}>
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-navy flex items-center justify-center shrink-0">
                      {conv.other_user?.avatar ? (
                        <img src={conv.other_user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-heading font-bold text-white text-sm">
                          {getInitials(conv.other_user?.name || 'U')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`font-heading text-sm truncate ${unread > 0 ? 'font-bold text-navy' : 'font-semibold text-gray-700'}`}>
                          {conv.other_user?.name || 'User'}
                        </p>
                        <span className="font-body text-xs text-gray-400 shrink-0 ml-2">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`font-body text-xs truncate ${unread > 0 ? 'text-navy font-medium' : 'text-gray-400'}`}>
                          {conv.last_message || 'Start a conversation'}
                        </p>
                        {unread > 0 && (
                          <span className="ml-2 w-5 h-5 bg-gold text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      {conv.other_user?.city && (
                        <p className="font-body text-xs text-gray-300 mt-0.5">{conv.other_user.city}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-gray-300" />
              </div>
              <p className="font-heading font-bold text-navy text-sm mb-1">No messages yet</p>
              <p className="font-body text-gray-400 text-xs mb-4 leading-relaxed">
                {currentUserRole === 'seeker'
                  ? 'Browse consultants and start a conversation'
                  : 'Conversations with visa seekers will appear here'}
              </p>
              {currentUserRole === 'seeker' && (
                <Link href="/consultants"
                  className="font-heading font-bold text-xs text-white px-4 py-2 rounded-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                  Browse Consultants
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
              <button onClick={() => setShowMobileChat(false)}
                className="lg:hidden p-1.5 text-navy hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={18} />
              </button>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-navy flex items-center justify-center shrink-0">
                {selectedConv.other_user?.avatar ? (
                  <img src={selectedConv.other_user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading font-bold text-white text-sm">
                    {getInitials(selectedConv.other_user?.name || 'U')}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-navy text-sm truncate">
                  {selectedConv.other_user?.name}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="font-body text-xs text-gray-400">
                    {selectedConv.other_user?.role === 'consultant' ? 'Visa Consultant' : 'Visa Seeker'}
                    {selectedConv.other_user?.city && ` · ${selectedConv.other_user.city}`}
                  </span>
                </div>
              </div>
              {selectedConv.other_user?.role === 'consultant' && (
                <Link href={`/consultants/${selectedConv.consultant_id}`}
                  className="font-heading font-bold text-xs text-navy border border-navy/20 bg-navy-light hover:bg-navy hover:text-white px-3 py-1.5 rounded-lg transition-all shrink-0">
                  View Profile
                </Link>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((msg, i) => {
                    const isOwn = msg.sender_id === currentUserId
                    const showAvatar = !isOwn && (i === 0 || messages[i-1].sender_id !== msg.sender_id)
                    const showTime = i === messages.length - 1 ||
                      new Date(messages[i+1].created_at).getTime() - new Date(msg.created_at).getTime() > 300000
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <div className={`w-7 h-7 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {selectedConv.other_user?.avatar ? (
                              <img src={selectedConv.other_user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading font-bold text-white text-xs">
                                {getInitials(selectedConv.other_user?.name || 'U')}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
                            isOwn ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}
                            style={isOwn ? { background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' } : {}}>
                            {msg.content}
                          </div>
                          {showTime && (
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="font-body text-xs text-gray-400">{timeAgo(msg.created_at)}</span>
                              {isOwn && (
                                msg.is_read
                                  ? <CheckCheck size={12} className="text-blue-400" />
                                  : <Clock size={11} className="text-gray-300" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-navy-light rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-navy/40" />
                  </div>
                  <p className="font-heading font-bold text-navy text-sm mb-1">Start the conversation</p>
                  <p className="font-body text-gray-400 text-xs max-w-xs leading-relaxed">
                    {currentUserRole === 'seeker'
                      ? 'Ask about visa requirements, fees or process'
                      : 'Introduce yourself and ask how you can help'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/10 transition-all">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="font-body text-sm w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 resize-none max-h-28"
                    style={{ height: 'auto' }}
                    onInput={e => {
                      const t = e.target as HTMLTextAreaElement
                      t.style.height = 'auto'
                      t.style.height = Math.min(t.scrollHeight, 112) + 'px'
                    }}
                  />
                </div>
                <button onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                  <Send size={16} className="text-white" />
                </button>
              </div>
              <p className="font-body text-xs text-gray-400 mt-2 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-navy-light rounded-3xl flex items-center justify-center mb-5">
              <MessageSquare size={32} className="text-navy/40" />
            </div>
            <h3 className="font-heading font-bold text-navy text-xl mb-2">Your Messages</h3>
            <p className="font-body text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
              Select a conversation from the left to start chatting
            </p>
            {currentUserRole === 'seeker' && (
              <Link href="/consultants"
                className="font-heading font-bold text-sm text-white px-6 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                Find Consultants to Message
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}