import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Minimize2, Maximize2, Clock } from 'lucide-react';
import '../styles/CustomerSupport.css';

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      text: 'Hello! How can we help you today?',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'read'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('userName') || 'Guest User',
    email: localStorage.getItem('userEmail') || 'user@example.com'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate admin response after 2 seconds
    setTimeout(() => {
      const adminMsg = {
        id: messages.length + 2,
        sender: 'admin',
        text: 'Thanks for your message. An admin will respond shortly.',
        timestamp: new Date(),
        status: 'read'
      };
      setMessages(prev => [...prev, adminMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button 
        className="support-fab"
        onClick={() => setIsOpen(true)}
        title="Customer Support"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`support-widget ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="support-header">
        <div className="header-content">
          <h3>Customer Support</h3>
          <span className="status-indicator online">Online</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button 
            className="icon-btn"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* User Info */}
          <div className="support-user-info">
            <div className="user-avatar">{userInfo.name[0].toUpperCase()}</div>
            <div>
              <p className="user-name">{userInfo.name}</p>
              <p className="user-email">{userInfo.email}</p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="support-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-bubble message-${message.sender}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-meta">
                    {formatTime(message.timestamp)}
                    {message.sender === 'user' && message.status === 'sent' && (
                      <span className="message-status">✓</span>
                    )}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble message-admin typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="support-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
            />
            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
