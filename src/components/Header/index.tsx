import React from 'react';
import { Brain } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
        <div>
          <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1 }}>Bot de Señales AI</h1>
          <span style={{ color: '#a5b4fc', fontSize: '1.1rem', fontWeight: 500 }}>Señales automáticas con precios reales y análisis en vivo</span>
        </div>
      </div>
  <div />
    </header>
  );
};

export default Header;
