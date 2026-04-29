import React, { useState, useEffect } from 'react';
import { Users, Store, Package, TrendingUp, MessageSquare } from 'lucide-react';
import '../styles/AdminPanel.css';
import {
  getAdminStats,
  getPendingSellers,
  approveSellerRequest,
  rejectSellerRequest,
  getAllUsers,
  getAllOrders,
  getSupportTickets
} from '../services/adminService';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-profile">
          <img src="https://via.placeholder.com/40" alt="Admin" className="admin-avatar" />
          <span>Admin User</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`nav-tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Support Tickets
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-content">
          <h2>Dashboard Overview</h2>
          
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users-icon">
                <Users size={32} />
              </div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon sellers-icon">
                <Store size={32} />
              </div>
              <div className="stat-info">
                <h3>Active Sellers</h3>
                <p className="stat-value">{stats.totalSellers}</p>
                <span className="stat-subtext">{stats.pendingSellers} pending</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orders-icon">
                <Package size={32} />
              </div>
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue-icon">
                <TrendingUp size={32} />
              </div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon support-icon">
                <MessageSquare size={32} />
              </div>
              <div className="stat-info">
                <h3>Active Chats</h3>
                <p className="stat-value">{stats.activeChats}</p>
                <span className="stat-subtext">Ongoing conversations</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <activity.icon size={20} />
                  </div>
                  <div className="activity-details">
                    <p>{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sellers Tab - Verification */}
      {activeTab === 'sellers' && (
        <div className="admin-content">
          <h2>Seller Management</h2>
          <SellerVerificationPanel />
        </div>
      )}

      {/* Products Tab - Moderation */}
      {activeTab === 'products' && (
        <div className="admin-content">
          <h2>Product Moderation</h2>
          <ProductModerationPanel />
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-content">
          <h2>Order Management</h2>
          <OrderManagementPanel />
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="admin-content">
          <h2>Customer Support Tickets</h2>
          <SupportTicketsPanel />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <h2>User Management</h2>
          <UserManagementPanel />
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="admin-content">
          <h2>Analytics & Reports</h2>
          <AnalyticsPanel />
        </div>
      )}
    </div>
  );
}

// Seller Verification Panel
function SellerVerificationPanel() {
  const [sellers, setSellers] = useState([
    { id: 1, name: 'My Crafts', email: 'crafts@example.com', status: 'pending', date: '2024-04-15' },
    { id: 2, name: 'Pottery House', email: 'pottery@example.com', status: 'pending', date: '2024-04-14' },
    { id: 3, name: 'Textile Arts', email: 'textile@example.com', status: 'approved', date: '2024-04-13' }
  ]);

  const handleApprove = (id) => {
    setSellers(sellers.map(s => s.id === id ? { ...s, status: 'approved' } : s));
  };

  const handleReject = (id) => {
    setSellers(sellers.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
  };

  return (
    <div className="panel-content">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map(seller => (
            <tr key={seller.id}>
              <td>{seller.name}</td>
              <td>{seller.email}</td>
              <td>{seller.date}</td>
              <td><span className={`status-badge status-${seller.status}`}>{seller.status}</span></td>
              <td>
                {seller.status === 'pending' && (
                  <div className="action-buttons">
                    <button className="btn-approve" onClick={() => handleApprove(seller.id)}>Approve</button>
                    <button className="btn-reject" onClick={() => handleReject(seller.id)}>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Product Moderation Panel
function ProductModerationPanel() {
  const [products] = useState([
    { id: 1, name: 'Handmade Vase', seller: 'My Crafts', status: 'pending', date: '2024-04-15' },
    { id: 2, name: 'Silk Saree', seller: 'Textile Arts', status: 'approved', date: '2024-04-14' }
  ]);

  return (
    <div className="panel-content">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Seller</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.seller}</td>
              <td>{product.date}</td>
              <td><span className={`status-badge status-${product.status}`}>{product.status}</span></td>
              <td>
                {product.status === 'pending' && (
                  <button className="btn-view">Review</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Order Management Panel
function OrderManagementPanel() {
  const [orders] = useState([
    { id: 'ORD001', customer: 'John Doe', amount: 5000, status: 'shipped', date: '2024-04-15' },
    { id: 'ORD002', customer: 'Jane Smith', amount: 8500, status: 'delivered', date: '2024-04-14' }
  ]);

  return (
    <div className="panel-content">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>₹{order.amount}</td>
              <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
              <td>{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Support Tickets Panel
function SupportTicketsPanel() {
  const [tickets] = useState([
    { id: 'TKT001', customer: 'User123', subject: 'Order not received', status: 'open', date: '2024-04-15' },
    { id: 'TKT002', customer: 'User456', subject: 'Payment issue', status: 'in-progress', date: '2024-04-14' }
  ]);

  return (
    <div className="panel-content">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Customer</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.customer}</td>
              <td>{ticket.subject}</td>
              <td><span className={`status-badge status-${ticket.status}`}>{ticket.status}</span></td>
              <td>{ticket.date}</td>
              <td><button className="btn-view">View Chat</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// User Management Panel
function UserManagementPanel() {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2024-03-15', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '2024-02-20', status: 'active' }
  ]);

  return (
    <div className="panel-content">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.joined}</td>
              <td><span className={`status-badge status-${user.status}`}>{user.status}</span></td>
              <td><button className="btn-view">View Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Analytics Panel
function AnalyticsPanel() {
  return (
    <div className="analytics-panel">
      <div className="chart-container">
        <h3>Sales Trend</h3>
        <div className="simple-chart">
          <div className="chart-bar" style={{ height: '60%' }}>Apr 10</div>
          <div className="chart-bar" style={{ height: '75%' }}>Apr 11</div>
          <div className="chart-bar" style={{ height: '80%' }}>Apr 12</div>
          <div className="chart-bar" style={{ height: '65%' }}>Apr 13</div>
          <div className="chart-bar" style={{ height: '85%' }}>Apr 14</div>
          <div className="chart-bar" style={{ height: '90%' }}>Apr 15</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>User Growth</h3>
        <div className="simple-chart">
          <div className="chart-bar" style={{ height: '50%' }}>Week 1</div>
          <div className="chart-bar" style={{ height: '65%' }}>Week 2</div>
          <div className="chart-bar" style={{ height: '75%' }}>Week 3</div>
          <div className="chart-bar" style={{ height: '85%' }}>Week 4</div>
        </div>
      </div>
    </div>
  );
}
