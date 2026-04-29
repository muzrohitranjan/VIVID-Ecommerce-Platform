import React, { useState } from 'react';
import SimpleChatModal from '../components/SimpleChatModal';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import '../styles/FAQ.css';

export default function FAQ() {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Account & Registration',
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking "Sign Up" on the homepage. Fill in your details including name, email, and password. You\'ll receive an OTP verification code on your email which you need to enter to complete registration.'
    },
    {
      id: 2,
      category: 'Account & Registration',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and you\'ll receive a password reset link via email. Follow the link to create a new password.'
    },
    {
      id: 3,
      category: 'Account & Registration',
      question: 'Can I change my email address?',
      answer: 'Yes, you can change your email address in your account settings. Go to Profile > Edit Profile > Email and update your email. You\'ll need to verify the new email with an OTP.'
    },
    {
      id: 4,
      category: 'Orders & Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept Credit/Debit Cards, UPI, Net Banking, Wallets, and Cash on Delivery (where available). All payments are secured with industry-standard encryption.'
    },
    {
      id: 5,
      category: 'Orders & Payments',
      question: 'How long does delivery take?',
      answer: 'Standard delivery typically takes 3-5 business days from the order date. Express delivery (where available) takes 1-2 business days. You can track your order in real-time through your Order History.'
    },
    {
      id: 6,
      category: 'Orders & Payments',
      question: 'What\'s your return policy?',
      answer: 'We offer 7 days easy returns for most items. The product should be in original condition with all packaging intact. Initiate a return from your Order History > Return/Replace.'
    },
    {
      id: 7,
      category: 'Products & Shopping',
      question: 'How can I find products from a specific seller?',
      answer: 'You can filter products by clicking on the seller\'s name or use the search feature to find specific sellers. Each product page shows the seller details and their ratings.'
    },
    {
      id: 8,
      category: 'Products & Shopping',
      question: 'Are the products authentic?',
      answer: 'Yes! All products on IIMSTC are from verified artisans and sellers. We have a strict verification process to ensure authenticity and quality. Check the seller\'s rating and reviews for more confidence.'
    },
    {
      id: 9,
      category: 'Seller Registration',
      question: 'How do I become a seller?',
      answer: 'Click on "Become a Seller" button. Fill in your business details and email. You\'ll receive an OTP for verification. Once verified, your account will be reviewed by our team before activation.'
    },
    {
      id: 10,
      category: 'Seller Registration',
      question: 'What documents do I need to register as a seller?',
      answer: 'For basic registration, you need your business name, address, phone number, and email. After approval, you may need to provide PAN/GSTIN for tax compliance based on your product value.'
    },
    {
      id: 11,
      category: 'Customer Support',
      question: 'How can I contact customer support?',
      answer: 'You can reach our support team through the Customer Support chat (blue button on the bottom right), email at support@iimstc.com, or phone during business hours. We typically respond within 24 hours.'
    },
    {
      id: 12,
      category: 'Customer Support',
      question: 'What are your operating hours?',
      answer: 'Our customer support team operates Monday to Friday, 9 AM to 6 PM IST. We also have automated responses for urgent issues 24/7. Chat support is available round the clock.'
    }
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="faq-container">
      {/* Header */}
      <div className="faq-header">
        <HelpCircle size={48} className="faq-icon" />
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about IIMSTC</p>
      </div>

      {/* Search Bar */}
      <div className="faq-search-section">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="faq-categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="faqs-list">
        {filteredFaqs.length === 0 ? (
          <div className="no-results">
            <Search size={48} />
            <h3>No FAQs found</h3>
            <p>Try searching with different keywords or select another category</p>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="faq-item">
              <button
                className="faq-question"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <span className="category-tag">{faq.category}</span>
                <span className="question-text">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`chevron ${expandedId === faq.id ? 'expanded' : ''}`}
                />
              </button>

              {expandedId === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Still Need Help */}
      <div className="faq-contact-section">
        <div className="contact-card">
          <h3>Still need help?</h3>
          <p>Can't find what you're looking for? Our support team is here to help.</p>
          <div className="contact-options">
            <button className="btn-support-chat" onClick={() => setChatOpen(true)}>Chat with Support</button>
            <button className="btn-send-email" onClick={() => window.location.href = 'mailto:vividh@support.com'}>Send Email</button>
            <SimpleChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
