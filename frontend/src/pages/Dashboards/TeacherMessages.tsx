import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';

interface Contact { _id: string; name: string; email: string; role: string; }
interface Message {
  _id?: string; senderId: string; receiverId: string; message: string;
  createdAt?: string;
}

const getUserId = (): string => {
  try {
    const token = localStorage.getItem('token') || '';
    return JSON.parse(atob(token.split('.')[1])).id || '';
  } catch { return ''; }
};

const roleColor: Record<string, string> = {
  student: '#16a34a',
  parent: '#d97706',
  teacher: '#2563eb',
};

const TeacherMessages: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token') || '';
  const myUserId = getUserId();

  useEffect(() => {
    const socket = io('http://localhost:5000', { auth: { userId: myUserId } });
    socketRef.current = socket;

    const bumpContact = (contactId: string) => {
      setContacts(prev => {
        const idx = prev.findIndex(c => c._id === contactId);
        if (idx <= 0) return prev;
        const updated = [...prev];
        const [moved] = updated.splice(idx, 1);
        return [moved, ...updated];
      });
    };

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      bumpContact(msg.senderId);
    });
    socket.on('message_sent', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      bumpContact(msg.receiverId);
    });
    return () => { socket.disconnect(); };
  }, [myUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      senderId: myUserId,
      receiverId: activeContact._id,
      message: inputText.trim()
    });
    setInputText('');
  };

  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const students = contacts.filter(c => c.role === 'student');
  const parents = contacts.filter(c => c.role === 'parent');
  const filteredStudents = students.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredParents = parents.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const ContactItem = ({ c }: { c: Contact }) => (
    <div
      onClick={() => openChat(c)}
      className={`d-flex align-items-center gap-3 p-3 border-bottom ${activeContact?._id === c._id ? 'bg-primary-soft' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
        style={{ width: 38, height: 38, background: roleColor[c.role] || '#64748b', fontSize: 14, flexShrink: 0 }}
      >
        {c.name.charAt(0).toUpperCase()}
      </div>
      <div className="overflow-hidden flex-grow-1">
        <div className="fw-bold text-dark small text-truncate">{c.name}</div>
        <div className="smallest text-muted fw-medium text-capitalize">{c.role}</div>
      </div>
    </div>
  );

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-hidden bg-light">
        <AdminHeader title="Teacher Messages" />

        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Contacts panel */}
          <div className="bg-white border-end d-flex flex-column" style={{ width: '300px', minWidth: '300px' }}>
            <div className="p-3 border-bottom">
              <input
                type="text"
                className="form-control form-control-sm border-light bg-light shadow-none fw-medium"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ borderRadius: 50 }}
              />
            </div>

            <div className="overflow-auto flex-grow-1">
              {loading ? (
                <div className="p-4 text-center text-muted smallest fw-bold">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="p-4 text-center text-muted smallest fw-bold opacity-50">No students or parents found</div>
              ) : (
                <>
                  {filteredStudents.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1">
                        <span className="smallest fw-bold text-muted text-uppercase ls-1" style={{ fontSize: 10 }}>
                          Students ({filteredStudents.length})
                        </span>
                      </div>
                      {filteredStudents.map(c => <ContactItem key={c._id} c={c} />)}
                    </>
                  )}
                  {filteredParents.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1">
                        <span className="smallest fw-bold text-muted text-uppercase ls-1" style={{ fontSize: 10 }}>
                          Parents ({filteredParents.length})
                        </span>
                      </div>
                      {filteredParents.map(c => <ContactItem key={c._id} c={c} />)}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-grow-1 d-flex flex-column overflow-hidden">
            {!activeContact ? (
              <div className="flex-grow-1 d-flex align-items-center justify-content-center flex-column gap-2">
                <div style={{ fontSize: 52 }}>💬</div>
                <h6 className="fw-bold text-muted text-uppercase ls-1 smallest">Select a student or parent to start messaging</h6>
                <span className="smallest text-muted opacity-50 fw-medium">{contacts.length} contacts available</span>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{ width: 38, height: 38, background: roleColor[activeContact.role] || '#64748b', fontSize: 14, flexShrink: 0 }}
                  >
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{activeContact.name}</div>
                    <div className="smallest fw-medium text-capitalize" style={{ color: roleColor[activeContact.role] }}>
                      {activeContact.role}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-2">
                  {msgLoading ? (
                    <div className="text-center text-muted smallest fw-bold">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted smallest fw-bold opacity-50 mt-5">
                      No messages yet. Start the conversation! 👋
                    </div>
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

                {/* Input */}
                <div className="bg-white border-top p-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control border-light bg-light fw-medium shadow-none"
                    placeholder={`Message ${activeContact.name}...`}
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

export default TeacherMessages;
