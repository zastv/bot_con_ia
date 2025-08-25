import React from 'react';
import { TradeEvent } from '../../types';

interface TradeFeedProps {
  events: TradeEvent[];
}

const colors: Record<string, string> = {
  CREATED: '#38bdf8',
  ACTIVATED: '#22d3ee',
  HIT_TP: '#16e0b3',
  HIT_SL: '#f472b6',
  CANCELLED: '#f59e0b',
  EXPIRED: '#94a3b8',
  INFO: '#a5b4fc',
};

const TradeFeed: React.FC<TradeFeedProps> = ({ events }) => {
  return (
    <section style={{ maxWidth: 1200, margin: '24px auto', background: 'rgba(30,27,75,0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 16 }}>
      <h3 style={{ color: '#a78bfa', margin: '0 0 8px 0' }}>Flujo de operaciones</h3>
      <div style={{ borderLeft: '2px solid #334155', paddingLeft: 12 }}>
        {events.length === 0 ? (
          <div style={{ color: '#64748b' }}>Sin eventos aún.</div>
        ) : (
          events
            .slice()
            .sort((a, b) => a.id - b.id)
            .map(ev => (
              <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'baseline', margin: '10px 0', position: 'relative' }}>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{ev.timestamp}</div>
                <div>
                  <span style={{ background: colors[ev.type] || '#a5b4fc', color: '#0b1220', borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 800, marginRight: 8 }}>{ev.type}</span>
                  <span style={{ color: '#e2e8f0' }}>{ev.message}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  );
};

export default TradeFeed;
