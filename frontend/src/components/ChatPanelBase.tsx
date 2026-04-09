import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Contact { _id: string; name: string; email: string; role: string; }
interface Message {
  _id?: string; senderId: string; receiverId: string; message: string;
  createdAt?: string; senderName?: string;
}

const getUserId = (): string => {
  try {
    const token = localStorage.getItem('token') || '';
    return JSON.parse(atob(token.split('.')[1])).id || '';
  } catch { return ''; }
};

interface ChatPanelProps {
  sidebarComponent: React.ReactNode;
  panelLabel: string;
  panelDescription: string;
  contactLabel: string;
  contactRole: string;
  sidebarBackground?: string;
}

const ChatPanelBase: React.FC<ChatPanelProps> = ({
  sidebarComponent, panelLabel, panelDescription, contactLabel, contactRole
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token') || '';
  const myUserId = getUserId();

  useEffect(() => {
    const socket = io('http://localhost:5000', { auth: { userId: myUserId } });
    socketRef.current = socket;
    socket.on('receive_message', (msg: Message) => setMessages(prev => [...prev, msg]));
    socket.on('message_sent', (msg: Message) => setMessages(prev => [...prev, msg]));
    return () => { socket.disconnect(); };
  }, [myUserId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    fetch('/api/chats/contacts', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setContacts(d.contacts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openChat = async (contact: Contact) => {
    setActiveContact(contact);
    setMsgLoading(true);
    try {
      const r = await fetch(`/api/chats/conversation/${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      setMessages(d.data || []);
    } catch { setMessages([]); }
    setMsgLoading(false);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !activeContact || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      senderId: myUserId, receiverId: activeContact._id, message: inputText.trim()
    });
    setInputText('');
  };

  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const roleColor: Record<string, string> = {
    teacher: '#2563eb', student: '#16a34a', parent: '#d97706'
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {sidebarComponent}
      <main className="flex-grow-1 d-flex flex-column overflow-hidden bg-light">
        <div className="bg-white border-bottom px-5 py-4">
          <h5 className="fw-bold text-dark mb-0">{panelLabel}</h5>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">{panelDescription}</span>
        </div>

        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Contacts */}
          <div className="bg-white border-end d-flex flex-column" style={{ width: '280px', minWidth: '280px' }}>
            <div className="p-3 border-bottom">
              <span className="smallest fw-bold text-muted text-uppercase ls-1">{contactLabel}</span>
            </div>
            <div className="overflow-auto flex-grow-1">
              {loading ? (
                <div className="p-4 text-center text-muted smallest fw-bold">Loading...</div>
              ) : contacts.length === 0 ? (
                <div className="p-4 text-center text-muted smallest fw-bold opacity-50">No contacts found</div>
              ) : contacts.map(c => (
                <div
                  key={c._id}
                  onClick={() => openChat(c)}
                  className={`d-flex align-items-center gap-3 p-3 border-bottom ${activeContact?._id === c._id ? 'bg-primary-soft' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{ width: 42, height: 42, background: roleColor[c.role] || '#64748b', fontSize: 16, flexShrink: 0 }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-bold text-dark small text-truncate">{c.name}</div>
                    <div className="smallest text-muted fw-medium">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-grow-1 d-flex flex-column overflow-hidden">
            {!activeContact ? (
              <div className="flex-grow-1 d-flex align-items-center justify-content-center flex-column gap-2">
                <div style={{ fontSize: 48 }}>💬</div>
                <span className="smallest fw-bold text-muted text-uppercase ls-1">Select a {contactRole} to start chatting</span>
              </div>
            ) : (
              <>
                <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{ width: 38, height: 38, background: roleColor[activeContact.role] || '#64748b', fontSize: 14, flexShrink: 0 }}
                  >
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{activeContact.name}</div>
                    <div className="smallest text-muted fw-medium text-capitalize">{activeContact.role}</div>
                  </div>
                </div>

                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-2">
                  {msgLoading ? (
                    <div className="text-center text-muted smallest fw-bold">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted smallest fw-bold opacity-50 mt-5">No messages yet. Say hello! 👋</div>
                  ) : messages.map((m, i) => {
                    const isMe = m.senderId?.toString() === myUserId;
                    return (
                      <div key={m._id || i} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div
                          className="px-3 py-2 rounded-4 small fw-medium"
                          style={{
                            maxWidth: '65%',
                            background: isMe ? '#2563eb' : '#f1f5f9',
                            color: isMe ? '#fff' : '#1e293b',
                            borderBottomRightRadius: isMe ? 4 : undefined,
                            borderBottomLeftRadius: !isMe ? 4 : undefined,
                          }}
                        >
                          <div>{m.message}</div>
                          <div style={{ fontSize: 10, opacity: 0.65, marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-white border-top p-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control border-light bg-light fw-medium shadow-none"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    style={{ borderRadius: 50 }}
                  />
                  <button
                    className="btn btn-primary fw-bold px-4 rounded-pill"
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPanelBase;
