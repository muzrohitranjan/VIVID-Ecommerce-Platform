import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';

import { dummyProducts } from '../data/products';

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMousePos({
        x: (e.clientX - centerX) / centerX, // Range: -1 to 1
        y: (e.clientY - centerY) / centerY
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <>
      <div 
        className="blob blob-1" 
        style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
      ></div>
      <div 
        className="blob blob-2" 
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      ></div>
      <div 
        className="blob blob-3" 
        style={{ transform: `translate(${mousePos.x * 70}px, ${mousePos.y * -70}px)` }}
      ></div>

      <header className="hero-bg animate-fade-up stagger-1 perspective-container" style={{ 
        textAlign: 'center', 
        marginBottom: '4rem',
        padding: '5rem 1rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Parallax Background Grid */}
        <div 
          className="hero-pattern parallax-layer" 
          style={{ 
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) scale(1.1) translateZ(-50px)` 
          }}
        ></div>

        {/* 3D Geometries */}
        <div className="cube-container parallax-layer" style={{ top: '15%', left: '10%', transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) translateZ(-30px)` }}>
          <div className="cube">
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>
        </div>

        <div className="cube-container parallax-layer" style={{ top: '60%', right: '15%', transform: `translate(${mousePos.x * 60}px, ${mousePos.y * -60}px) translateZ(20px) scale(0.6)` }}>
          <div className="cube cube-reverse">
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>
        </div>
        
        {/* Parallax Foreground Content */}
        <div 
          className="hero-content preserve-3d parallax-layer" 
          style={{ 
            position: 'relative',
            transform: `rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg) translateZ(50px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto'
          }}
        >
          <h2 style={{ 
            fontSize: '4.5rem', 
            color: 'var(--color-surface)', 
            marginBottom: '1.2rem', 
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            transform: 'translateZ(60px)' 
          }}>
            Discover Indian Artistry
          </h2>
          
          <p style={{ 
            maxWidth: '650px', 
            fontSize: '1.3rem', 
            color: 'var(--color-surface)', 
            opacity: 0.9,
            marginBottom: '3rem',
            transform: 'translateZ(30px)'
          }}>
            Buy authentic handmade crafts directly from rural artisans across India. 
            Every purchase supports their livelihood and preserves our heritage.
          </p>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', transform: 'translateZ(80px)' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 10 }} />
            <input 
              type="text" 
              placeholder="Search for pottery, sarees, toys..." 
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                paddingLeft: '3.5rem', 
                paddingTop: '1.2rem',
                paddingBottom: '1.2rem',
                borderRadius: 'var(--radius-full)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: 'none',
                fontSize: '1.1rem'
              }}
            />
          </div>
        </div>
      </header>

      <div className="animate-fade-up stagger-2" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Featured Products</h3>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Handpicked distinct creations from skilled artisans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '3rem'
      }}>
        {dummyProducts
          .filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.artisan.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item, index) => (
          <ProductCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </>
  );
}
