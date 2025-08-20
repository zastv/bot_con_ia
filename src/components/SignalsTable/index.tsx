import React from 'react';
import { Filter, BarChart3 } from 'lucide-react';
import { Signal } from '../../types';

interface SignalsTableProps {
  filteredSignals: Signal[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
  onSetActive: (signal: Signal) => void;
}

const SignalsTable: React.FC<SignalsTableProps> = ({
  filteredSignals,
  filterCategory,
  setFilterCategory,
  categories,
  onSetActive,
}) => {
  return (
    <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#a78bfa', fontSize: '1.4rem', fontWeight: 700, letterSpacing: 1, margin: 0 }}>
          Últimas señales ({filteredSignals.length})
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={16} style={{ color: '#a5b4fc' }} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              color: '#e0e7ff',
              border: '1px solid #6d28d9',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.9rem',
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', fontSize: '1.05rem', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #6d28d9', color: '#a5b4fc' }}>
              <th style={{ padding: 10 }}>Par</th>
              <th style={{ padding: 10 }}>Señal</th>
              <th style={{ padding: 10 }}>Confianza</th>
              <th style={{ padding: 10 }}>Entrada</th>
              <th style={{ padding: 10 }}>TP</th>
              <th style={{ padding: 10 }}>SL</th>
              <th style={{ padding: 10 }}>Hora</th>
              <th style={{ padding: 10 }}>Notas</th>
              <th style={{ padding: 10 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #334155', background: s.signal === 'BUY' ? 'rgba(34,211,238,0.04)' : 'rgba(244,114,182,0.04)' }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{s.display}</td>
                <td style={{ padding: 10, color: s.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 'bold', letterSpacing: 1 }}>{s.signal}</td>
                <td style={{ padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ 
                      width: '40px', 
                      height: '6px', 
                      background: 'rgba(107, 114, 128, 0.3)', 
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${s.confidence}%`, 
                        height: '100%', 
                        background: s.confidence > 80 ? '#22d3ee' : s.confidence > 60 ? '#fbbf24' : '#f472b6',
                        borderRadius: 3
                      }}></div>
                    </div>
                    {s.confidence}%
                  </div>
                </td>
                <td style={{ padding: 10 }}>{s.entry}</td>
                <td style={{ padding: 10, color: '#16e0b3' }}>{s.tp}</td>
                <td style={{ padding: 10, color: '#f472b6' }}>{s.sl}</td>
                <td style={{ padding: 10 }}>{s.timestamp}</td>
                <td style={{ padding: 10, color: '#fbbf24', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => onSetActive(s)}
                    style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.98rem', boxShadow: '0 1px 4px #6d28d933', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <BarChart3 size={14} />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {filteredSignals.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                  No hay señales disponibles para los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 18, textAlign: 'center' }}>
        <b>Tip:</b> Recuerda siempre usar gestión de riesgo y no operar solo por la señal. Considera el contexto del mercado y noticias relevantes.
      </div>
    </section>
  );
};

export default SignalsTable;
