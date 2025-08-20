import React from 'react';
import { Brain, Play, Pause, Settings } from 'lucide-react';

interface HeaderProps {
  running: boolean;
  showSettings: boolean;
  onToggleBot: () => void;
  onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
  running,
  showSettings,
  onToggleBot,
  onToggleSettings,
}) => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 8vw 16px 8vw', background: 'rgba(30, 27, 75, 0.98)', borderBottom: '2px solid #6d28d9', boxShadow: '0 2px 16px #0002' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Brain style={{ width: 48, height: 48, color: '#a78bfa', marginRight: 16 }} />
        <div>
          <h1 style={{ color: '#e0e7ff', fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: 1 }}>Bot de Señales AI</h1>
          <span style={{ color: '#a5b4fc', fontSize: '1.1rem', fontWeight: 500 }}>Señales automáticas con precios reales y análisis en vivo</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button
          onClick={onToggleSettings}
          style={{
            background: 'rgba(107, 114, 128, 0.3)',
            color: '#a5b4fc',
            border: '1px solid #6d28d9',
            borderRadius: 12,
            padding: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Settings size={20} />
        </button>
        <button
          onClick={onToggleBot}
          style={{
            background: running ? '#f472b6' : '#22d3ee',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 32px',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: running ? '0 2px 8px #f472b633' : '0 2px 8px #22d3ee33',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? 'Parar' : 'Iniciar'}
        </button>
      </div>
    </header>
  );
};

export default Header;
