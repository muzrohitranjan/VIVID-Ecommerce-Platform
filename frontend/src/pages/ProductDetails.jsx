import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { dummyProducts } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = dummyProducts.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();

  if (!product) return <h2>Product not found</h2>;

  return (
    <div className="container animate-fade-up perspective-container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <Link to="/" className="stagger-1" style={{ color: 'var(--color-primary)', display: 'inline-block', margin: '0 0 2rem 1rem', fontWeight: 600 }}>
        &larr; Back to Marketplace
      </Link>
      
      <div className="glass-panel stagger-2 animate-fade-up preserve-3d" style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', padding: '3rem', margin: '1rem', borderRadius: 'var(--radius-lg)' }}>
        
        <div className="preserve-3d" style={{ flex: '1 1 400px', borderRadius: 'var(--radius-md)', transform: 'translateZ(40px)', transition: 'transform 0.5s ease' }}>
          <img 
            src={product.image} 
            alt={product.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'var(--radius-md)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}
          />
        </div>

        <div className="preserve-3d" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', transform: 'translateZ(20px)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <span style={{ 
              backgroundColor: 'var(--color-accent)', 
              color: 'var(--color-text-dark)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.8rem', 
              fontWeight: 700 
            }}>
              Authentic Craft
            </span>
            <button className="btn-icon-only">
              <Heart size={24} color="var(--color-text-muted)" />
            </button>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.title}</h1>
          
          <div className="flex items-center gap-2 text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            <MapPin size={20} color="var(--color-secondary)" />
            <span>Crafted by <strong>{product.artisan}</strong> in {product.location}</span>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', color: 'var(--color-text-dark)' }}>
            {product.description}
          </p>

          <div style={{ 
            marginTop: 'auto', 
            borderTop: '1px solid rgba(0,0,0,0.1)', 
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <p className="text-muted" style={{ margin: 0 }}>Price</p>
              <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--color-primary)' }}>
                ₹{product.price}
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '1.1rem', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                onClick={() => {
                  addToCart(product);
                  alert('Added to cart!');
                }}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button 
                className="btn btn-primary" 
                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                onClick={() => {
                  addToCart(product);
                  navigate('/cart');
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--color-success)', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} />
            Genuine product. 100% money goes to the artisan.
          </div>

        </div>
      </div>
    </div>
  );
}
