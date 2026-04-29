import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Dashboard Stats
export const getAdminStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`);
    return {
      success: true,
      data: response.data.stats
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch stats'
    };
  }
};

// Sellers
export const getPendingSellers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/sellers-pending`);
    return {
      success: true,
      data: response.data.sellers
    };
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch sellers'
    };
  }
};

export const approveSellerRequest = async (sellerId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/seller-action`, {
      sellerId,
      action: 'approve'
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error approving seller:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to approve seller'
    };
  }
};

export const rejectSellerRequest = async (sellerId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/seller-action`, {
      sellerId,
      action: 'reject'
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error rejecting seller:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reject seller'
    };
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return {
      success: true,
      data: response.data.users
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch users'
    };
  }
};

// Orders
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/orders`);
    return {
      success: true,
      data: response.data.orders
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

// Support Tickets
export const getSupportTickets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/support-tickets`);
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

// Check Admin Response
export const checkAdminResponse = async (ticketId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/ticket/${ticketId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error checking admin response:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check response'
    };
  }
};
