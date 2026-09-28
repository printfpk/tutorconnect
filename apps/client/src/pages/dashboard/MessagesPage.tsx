import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Send, MoreVertical, Search, CheckCheck, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
}

interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  updatedAt: string;
}

interface Message {
  _id: string;
  chatId: string;
  senderId: string | Participant;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { token, user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats on mount
  useEffect(() => {
    setLoading(true);
    api.get('/chats')
      .then(res => {
        const data = res?.data?.data?.chats;
        const fetched: Chat[] = Array.isArray(data) ? data : [];
        setChats(fetched);
        if (fetched.length > 0) {
          setActiveChat(fetched[0]._id);
        }
      })
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    api.get(`/chats/${activeChat}/messages`)
      .then(res => {
        const data = res?.data?.data?.messages;
        setMessages(Array.isArray(data) ? data : []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => toast.error('Failed to load messages'));
  }, [activeChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherParticipant = (chat: Chat): Participant | null => {
    if (!chat || !Array.isArray(chat.participants)) return null;
    return chat.participants.find(p => p._id !== user?._id) ?? null;
  };

  const getSenderId = (msg: Message): string => {
    if (typeof msg.senderId === 'string') return msg.senderId;
    return (msg.senderId as Participant)?._id ?? '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const res = await api.post(`/chats/${activeChat}/messages`, { content });
      const saved = res?.data?.data?.message;
      if (saved) {
        setMessages(prev => [...prev, saved]);
        setChats(prev => prev.map(c =>
          c._id === activeChat ? { ...c, lastMessage: saved, updatedAt: saved.createdAt } : c
        ));
      }
    } catch {
      toast.error('Failed to send message');
      setNewMessage(content);
    }
  };

  const activeChatData = chats.find(c => c._id === activeChat) ?? null;
  const otherParticipant = activeChatData ? getOtherParticipant(activeChatData) : null;

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      background: 'white',
      borderRadius: 24,
      border: '1px solid var(--gray-200)',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      {/* Sidebar */}
      <div style={{ width: 320, borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 14px' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--gray-400)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search..."
              style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: 999, border: '1px solid var(--gray-200)', background: 'var(--gray-50)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.88rem' }}>Loading...</div>
          ) : chats.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <MessageCircle size={40} color="var(--gray-300)" style={{ marginBottom: 12 }} />
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: 0 }}>No conversations yet</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem', marginTop: 6 }}>Start chatting from a tutor's profile</p>
            </div>
          ) : (
            chats.map(chat => {
              const other = getOtherParticipant(chat);
              if (!other) return null;
              const isActive = activeChat === chat._id;
              return (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat._id)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: isActive ? 'var(--lavender-soft)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--indigo)' : 'transparent'}`
                  }}
                >
                  <img
                    src={other.avatar || `https://ui-avatars.com/api/?name=${other.firstName}+${other.lastName}&background=7c6de6&color=fff`}
                    alt="avatar"
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {other.firstName} {other.lastName}
                      </span>
                      {chat.lastMessage?.createdAt && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', flexShrink: 0 }}>
                          {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--gray-50)' }}>
        {activeChat && activeChatData ? (
          <>
            {/* Header */}
            <div style={{ padding: '18px 24px', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.firstName}+${otherParticipant?.lastName}&background=7c6de6&color=fff`}
                  alt="avatar"
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Chat'}
                  </h3>
                  <span style={{ fontSize: '0.77rem', color: '#22c55e' }}>● Online</span>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}>
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.88rem', marginTop: 40 }}>
                  No messages yet. Say hello! 👋
                </div>
              )}
              {messages.map((msg, idx) => {
                const senderId = getSenderId(msg);
                const isMe = senderId === user?._id;
                return (
                  <div key={msg._id ?? idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '68%' }}>
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: 18,
                      borderBottomRightRadius: isMe ? 4 : 18,
                      borderBottomLeftRadius: isMe ? 18 : 4,
                      background: isMe ? 'var(--indigo)' : 'white',
                      color: isMe ? 'white' : 'var(--gray-800)',
                      boxShadow: isMe ? '0 4px 12px rgba(92,106,196,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
                      border: isMe ? 'none' : '1px solid var(--gray-200)'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.93rem', lineHeight: 1.45 }}>{msg.content}</p>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)', marginTop: 3, textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <CheckCheck size={11} />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid var(--gray-200)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '12px 18px', borderRadius: 999, border: '1px solid var(--gray-200)', background: 'var(--gray-50)', fontSize: '0.93rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: newMessage.trim() ? 'var(--indigo)' : 'var(--gray-300)',
                    color: 'white', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                  }}
                >
                  <Send size={16} style={{ transform: 'translate(-1px, 1px)' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--gray-400)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={36} color="var(--gray-300)" />
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--gray-500)' }}>Select a conversation</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-400)' }}>or start one from a tutor's profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
