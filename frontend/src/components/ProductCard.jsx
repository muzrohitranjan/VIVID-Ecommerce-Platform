import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ item, index = 0 }) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const staggerClass = `stagger-${(index % 8) + 1}`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates between -0.5 and 0.5
    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;
    
    // Max rotation of 18 degrees
    const rotateX = yPct * -18;
    const rotateY = xPct * 18;

    // Dynamic 3D lighting shadow based on tilt
    const shadowX = xPct * -30;
    const shadowY = yPct * -30;

    setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    cardRef.current.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0,0,0,0.2)`;
  };

  const handleMouseLeave = () => {
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    if (cardRef.current) cardRef.current.style.boxShadow = 'var(--shadow-sm)';
  };

  return (
    <div className={`perspective-container animate-fade-up ${staggerClass}`}>
      <div 
        ref={cardRef}
        className="card flex-col tilt-card" 
        style={{ display: 'flex', position: 'relative', transform: transformStyle }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="tilt-highlight"></div>
        
        {/* Popped out content container */}
        <div className="tilt-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="btn-icon-only"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              transform: 'translateZ(20px)' /* Pops off the card */
            }}
            aria-label="Like product"
          >
            <Heart size={20} color={isLiked ? 'var(--color-danger)' : 'var(--color-text-dark)'} fill={isLiked ? 'var(--color-danger)' : 'none'} />
          </button>
          
          <div className="card-img-wrapper" style={{ width: '100%', height: '260px', borderBottom: '1px solid #eee' }}>
            <img 
              src={item.image} 
              alt={item.title} 
              className="card-img-zoom"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }} 
            />
          </div>
          
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', transform: 'translateZ(15px)' }}>{item.title}</h3>
            
            <p className="text-muted" style={{ 
              fontSize: '0.9rem', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              marginBottom: '1rem',
              transform: 'translateZ(10px)'
            }}>
              {item.description}
            </p>
            
            <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', transform: 'translateZ(5px)' }}>
              <MapPin size={16} color="var(--color-secondary)" />
              <span>{item.artisan}, {item.location}</span>
            </div>
            
            <div className="flex items-center justify-between" style={{ marginTop: 'auto', transform: 'translateZ(20px)' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                ₹{item.price}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(item);
                    alert(`${item.title} added to cart!`);
                  }}
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative' }}
                  title="Add to Cart"
                >
                  <ShoppingBag size={18} />
                </button>
                <Link to={`/product/${item.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', zIndex: 10, position: 'relative' }}>
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
