import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get Support Chat
export const getSupportChat = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/support/chat/${userId}`);
    return {
      success: true,
      data: response.data.chat
    };
  } catch (error) {
    console.error('Error fetching support chat:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chat'
    };
  }
};

// Send Support Message
export const sendSupportMessage = async (userId, message, sender = 'user') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/support/message`, {
      userId,
      text: message,
      sender
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error sending support message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message'
    };
  }
};

// Get User Support Tickets
export const getUserSupportTickets = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/support/tickets/${userId}`);
    return {
      success: true,
      data: response.data.tickets
    };
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch tickets'
    };
  }
};

// Create Support Ticket
export const createSupportTicket = async (userId, subject, message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/support/create-ticket`, {
      userId,
      subject,
      message
    });
    return {
      success: true,
      data: response.data,
      message: 'Ticket created successfully'
    };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create ticket'
    };
  }
};

// Polling function for new admin messages
export const checkForNewMessages = async (userId, lastMessageId) => {
  try {
    const chat = await getSupportChat(userId);
    if (chat.success && chat.data.messages) {
      const newMessages = chat.data.messages.filter(m => m.id > lastMessageId);
      return {
        success: true,
        newMessages: newMessages,
        hasNewMessages: newMessages.length > 0
      };
    }
    return { success: false, hasNewMessages: false };
  } catch (error) {
    console.error('Error checking for new messages:', error);
    return { success: false, hasNewMessages: false };
  }
};

// Setup real-time message polling
export const startMessagePolling = (userId, callback, interval = 3000) => {
  let lastMessageId = 0;

  const pollMessages = async () => {
    const result = await checkForNewMessages(userId, lastMessageId);
    if (result.success && result.hasNewMessages) {
      lastMessageId = Math.max(...result.newMessages.map(m => m.id));
      callback(result.newMessages);
    }
  };

  // Start polling
  const pollInterval = setInterval(pollMessages, interval);

  // Return function to stop polling
  return () => clearInterval(pollInterval);
};
