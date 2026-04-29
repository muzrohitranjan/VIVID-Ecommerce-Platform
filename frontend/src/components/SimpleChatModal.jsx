import React, { useState } from 'react';
import '../styles/CustomerSupport.css';

export default function SimpleChatModal({ open, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hello! How can we help you today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
    // Simulate support reply
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'support', text: 'Thank you for your message. Our team will get back to you soon.' }]);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="simple-chat-modal-overlay">
      <div className="simple-chat-modal">
        <div className="simple-chat-header">
          <span>Support Chat</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="simple-chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.from}`}>{msg.text}</div>
          ))}
        </div>
        <div className="simple-chat-footer">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
