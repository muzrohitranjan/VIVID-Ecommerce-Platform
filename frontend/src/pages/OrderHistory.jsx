import React, { useState } from 'react';
import { Package, ShoppingBag, Truck, CheckCircle, Download, Eye } from 'lucide-react';
import '../styles/OrderHistory.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-001',
      date: '2024-04-15',
      items: [{ name: 'Handmade Vase', quantity: 1, price: 5000 }],
      total: 5500,
      status: 'delivered',
      deliveryDate: '2024-04-18',
      seller: 'My Crafts'
    },
    {
      id: 'ORD-2024-002',
      date: '2024-04-10',
      items: [
        { name: 'Silk Saree', quantity: 1, price: 8500 },
        { name: 'Wooden Jewelry Box', quantity: 2, price: 1500 }
      ],
      total: 11500,
      status: 'shipped',
      deliveryDate: '2024-04-20',
      seller: 'Textile Arts & More'
    },
    {
      id: 'ORD-2024-003',
      date: '2024-03-28',
      items: [{ name: 'Ceramic Plate Set', quantity: 1, price: 3500 }],
      total: 3850,
      status: 'delivered',
      deliveryDate: '2024-04-02',
      seller: 'Pottery House'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle size={20} />;
      case 'shipped': return <Truck size={20} />;
      case 'processing': return <Package size={20} />;
      default: return <ShoppingBag size={20} />;
    }
  };

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Order History</h1>
        <p>View and manage your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="order-filters">
        {['all', 'delivered', 'shipped', 'processing'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="count">
              {status === 'all'
                ? orders.length
                : orders.filter(o => o.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <ShoppingBag size={48} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-id-section">
                  <h3>{order.id}</h3>
                  <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
              </div>

              <div className="order-seller-info">
                <span className="seller-label">Seller: </span>
                <span className="seller-name">{order.seller}</span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <strong>₹{order.total.toLocaleString()}</strong>
                </div>
                <div className="order-actions">
                  <button 
                    className="btn-details"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <Eye size={16} />
                    Details
                  </button>
                  <button className="btn-download">
                    <Download size={16} />
                    Invoice
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedOrder?.id === order.id && (
                <div className="order-expanded">
                  <div className="timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Order Placed</h4>
                        <p>{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status !== 'delivered' ? 'active' : 'completed'}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Processing</h4>
                        <p>Your order is being prepared</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : order.status === 'shipped' ? 'active' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Shipped</h4>
                        <p>Package is on its way</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Delivered</h4>
                        <p>{order.status === 'delivered' ? new Date(order.deliveryDate).toLocaleDateString() : 'Pending'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="expanded-actions">
                    <button className="btn-primary">Track Package</button>
                    <button className="btn-secondary">Return/Replace</button>
                    <button className="btn-secondary">Contact Support</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
