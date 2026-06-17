import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Card, Btn } from '../helpers.jsx';
import { C, bgPage, accent } from '../constants.js';
import { Input } from '../components/FormElements.jsx';

const MessagesPage = () => {
  const { user, token } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!token) return;
    api.getJobs()
      .then(jobs => {
        const mockConversations = [
          { id: 'c1', jobId: 'j1', otherUserName: 'Thandi Nkosi', otherUserId: 'f1', lastMessageAt: '2025-06-03 10:23', role: 'freelancer' },
          { id: 'c2', jobId: 'j2', otherUserName: 'Johan van der Berg', otherUserId: 'f2', lastMessageAt: '2025-06-01 14:45', role: 'freelancer' },
        ];
        setConversations(mockConversations);
      })
      .catch(err => {
        if (import.meta.env.DEV) console.error("Failed to load conversations:", err);
      });
  }, [token]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    const mockMessages = [
      { id: 'm1', senderId: conv.otherUserId, text: 'Hi! I saw your job posting. Very interested!', time: '10:20' },
      { id: 'm2', senderId: user.id, text: 'Great! Can you tell me about your experience?', time: '10:22' },
      { id: 'm3', senderId: conv.otherUserId, text: 'Of course! I have 15 years of experience...', time: '10:23' },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !token) return;

    try {
      await api.sendMessage(
        { jobId: selectedConversation.jobId, recipientId: selectedConversation.otherUserId, body: messageText },
        token
      );
      setMessages([...messages, { id: 'temp', senderId: user.id, text: messageText, time: new Date().toLocaleTimeString() }]);
      setMessageText('');
    } catch (err) {
      if (import.meta.env.DEV) console.error("Failed to send message:", err);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ background: '#fff', borderRight: `1px solid ${C.gray[200]}` }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.gray[200]}` }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.gray[900], margin: 0 }}>Messages</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 110px)' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: C.gray[500] }}>No conversations</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${C.gray[100]}`,
                    cursor: 'pointer',
                    background: selectedConversation?.id === conv.id ? C.gray[50] : '#fff',
                    borderLeft: selectedConversation?.id === conv.id ? `3px solid ${accent}` : 'transparent',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.gray[900] }}>{conv.otherUserName}</div>
                  <div style={{ fontSize: 12, color: C.gray[500], marginTop: 2 }}>{conv.lastMessageAt}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.gray[900], margin: 0 }}>{selectedConversation.otherUserName}</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '70%',
                        background: msg.senderId === user.id ? accent : C.gray[100],
                        color: msg.senderId === user.id ? '#fff' : C.gray[900],
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.gray[200]}`, display: 'flex', gap: 8 }}>
                <Input value={messageText} onChange={setMessageText} placeholder="Type a message..." style={{ flex: 1 }} />
                <Btn onClick={handleSendMessage} disabled={!messageText.trim()}>Send</Btn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: C.gray[400] }}>
              <div>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div>Select a conversation to start messaging</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
