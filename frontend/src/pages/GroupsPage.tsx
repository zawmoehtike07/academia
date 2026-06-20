import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, Users, MessageSquare, Crown, Send, Plus, UserPlus, X } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { groupApi, type GroupResponse, type MemberResponse } from '../api/groupApi';
import { messageApi, type MessageResponse } from '../api/messageApi';
import { useAuth } from '../context/AuthContext';

// ─── STOMP/SockJS chat hook ───────────────────────────────────────────────────
function useStomp(
  groupId: number | null,
  token: string | null,
  onMessage: (msg: MessageResponse) => void
) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!groupId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      
      // ✅ Added logging to confirm connection
      onConnect: () => {
        console.log(`✅ Connected to WebSocket for Group ${groupId}`);
        client.subscribe(`/topic/groups/${groupId}`, (frame) => {
          try {
            const msg: MessageResponse = JSON.parse(frame.body);
            onMessageRef.current(msg);
          } catch { /* ignore malformed */ }
        });
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP Protocol Error:', frame);
      },
      
      // ✅ Added explicit WebSocket error catching
      onWebSocketError: (event) => {
        console.error('❌ Underlying WebSocket Error (Check backend CORS/Auth):', event);
      },
      
      // ✅ Added explicit disconnect logging
      onWebSocketClose: (event) => {
        console.warn('⚠️ WebSocket Closed:', event);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('🔌 Deactivating WebSocket client...');
      client.deactivate();
    };
  }, [groupId, token]);

  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current;
    
    // ✅ Added an alert/log if trying to send while disconnected
    if (!client?.connected) {
      console.error('Cannot send message: WebSocket is not connected.');
      return;
    }
    
    client.publish({
      destination: `/app/chat/${groupId}`,
      body: JSON.stringify({ content, messageType: 'USER_MESSAGE' }),
    });
  }, [groupId]);

  return { sendMessage };
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────
function AddMemberModal({ groupId, onClose, onAdded }: {
  groupId: number; onClose: () => void; onAdded: () => void;
}) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await groupApi.addMember(groupId, username.trim());
      setSuccess(`✓ ${username} added to the group!`);
      setUsername('');
      onAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'User not found or already a member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--bg-card)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-3 rounded-xl">{error}</p>}
        {success && <p className="text-teal-700 text-sm mb-3 bg-teal-50 p-3 rounded-xl">{success}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required
              placeholder="Enter exact username"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>The user must already have an account.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border py-2.5 rounded-xl font-medium transition"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Done</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#0f766e] text-white py-2.5 rounded-xl font-medium hover:bg-teal-800 disabled:opacity-60 transition">
              {loading ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreate }: {
  onClose: () => void; onCreate: (g: GroupResponse) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { onCreate(await groupApi.createGroup({ name, description })); }
    catch { setError('Failed to create group.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--bg-card)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Create a Group</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Group Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. OChem Survivors"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="What does this group study?"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border py-2.5 rounded-xl font-medium transition"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#0f766e] text-white py-2.5 rounded-xl font-medium hover:bg-teal-800 disabled:opacity-60 transition">
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Group Detail ─────────────────────────────────────────────────────────────
function GroupDetail({ group, onBack }: { group: GroupResponse; onBack: () => void }) {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Info' | 'Chat'>('Info');
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadMembers = () => {
    setLoadingMembers(true);
    groupApi.getMembers(group.id).then(setMembers).catch(() => {}).finally(() => setLoadingMembers(false));
  };

  useEffect(() => {
    if (activeTab === 'Info') loadMembers();
    if (activeTab === 'Chat') {
      setChatLoading(true);
      messageApi.getHistory(group.id).then(msgs => {
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      }).catch(() => {}).finally(() => setChatLoading(false));
    }
  }, [activeTab, group.id]);

  const { sendMessage } = useStomp(
    activeTab === 'Chat' ? group.id : null,
    token,
    (msg) => { setMessages(prev => [...prev, msg]); setTimeout(scrollToBottom, 50); }
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    sendMessage(t);
    setInput('');
  };

  const isOwner = members.find(m => m.username === user?.username)?.isOwner ?? false;

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto">
      {showAddMember && (
        <AddMemberModal groupId={group.id} onClose={() => setShowAddMember(false)} onAdded={loadMembers} />
      )}

      <div className="mb-5 mt-4">
        <button onClick={onBack}
          className="flex items-center text-sm font-medium mb-4 transition hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} /> Groups
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0f766e] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{group.name}</h1>
            {group.description && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{group.description}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-3xl p-1.5 mb-5 border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        {(['Info', 'Chat'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition"
            style={{
              background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
            {tab === 'Info' ? <Users size={15} /> : <MessageSquare size={15} />} {tab}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {activeTab === 'Info' && (
        <div className="space-y-4 pb-4">
          {group.description && (
            <div className="rounded-[2rem] p-6 border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="text-xs font-bold tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>ABOUT</h2>
              <p style={{ color: 'var(--text-primary)' }}>{group.description}</p>
            </div>
          )}
          <div className="rounded-[2rem] p-6 border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>MEMBERS</h2>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>{group.memberCount}</span>
              </div>
              {isOwner && (
                <button onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition px-3 py-1.5 rounded-full dark:bg-teal-900/30 dark:text-teal-400">
                  <UserPlus size={13} /> Add member
                </button>
              )}
            </div>
            {loadingMembers ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--bg)' }} />)}</div>
            ) : (
              <div className="space-y-5">
                {members.map(m => (
                  <div key={m.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.username}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </div>
                    {m.isOwner && (
                      <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                        <Crown size={12} /> Owner
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'Chat' && (
        <div className="rounded-[2rem] border flex flex-col shadow-sm mb-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', height: '500px' }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {chatLoading ? (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-muted)' }}>Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-muted)' }}>No messages yet. Say hello! 👋</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="space-y-1 flex flex-col items-start">
                  <p className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{msg.senderUsername}</p>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed"
                    style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border)' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <button type="submit" className="w-11 h-11 bg-[#0f766e] hover:bg-teal-800 text-white rounded-full flex items-center justify-center transition shadow-sm">
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Main Groups Page ─────────────────────────────────────────────────────────
export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<GroupResponse | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    groupApi.getMyGroups()
      .then(setGroups)
      .catch(() => setError('Failed to load groups.'))
      .finally(() => setLoading(false));
  }, []);

  if (selected) return <GroupDetail group={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto">
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)}
          onCreate={g => { setGroups(prev => [g, ...prev]); setShowCreate(false); setSelected(g); }} />
      )}

      <div className="flex justify-between items-start mb-6 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Groups</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Your study communities.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0f766e] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-teal-800 transition shadow-sm">
          <Plus size={16} /> New
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-2xl p-4 mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'var(--bg-card)' }} />)}</div>
      ) : groups.length === 0 ? (
        <div className="rounded-[2rem] border p-12 text-center shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-teal-600"><Users size={28} /></div>
          <h2 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No groups yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Create one to start studying with others.</p>
          <button onClick={() => setShowCreate(true)}
            className="bg-[#0f766e] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition">
            Create a Group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <button key={g.id} onClick={() => setSelected(g)}
              className="w-full rounded-[1.5rem] border p-5 text-left hover:shadow-md transition shadow-sm flex items-center gap-4"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                {g.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{g.name}</div>
                {g.description && <div className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{g.description}</div>}
              </div>
              <div className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <Users size={13} /> {g.memberCount}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}