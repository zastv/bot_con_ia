import React from 'react';
import { Filter, BarChart3 } from 'lucide-react';
import { Signal } from '../../types';

interface SignalsTableProps {
  filteredSignals: Signal[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
  onSetActive: (signal: Signal) => void;
  // Metadatos del sistema de lotes
  batchMeta?: {
    batchCount?: number;
    batchSignals?: number;
    nextBatchTime?: number | null;
  };
  activeSignalId?: number | null;
}

const SignalsTable: React.FC<SignalsTableProps> = ({
  filteredSignals,
  filterCategory,
  setFilterCategory,
  categories,
  onSetActive,
  batchMeta,
  activeSignalId,
}) => {
  const current = (activeSignalId && filteredSignals.find(s => s.id === activeSignalId)) || filteredSignals[0];
  const remainingMins = batchMeta?.nextBatchTime ? Math.max(0, Math.ceil((batchMeta.nextBatchTime - Date.now()) / 60000)) : null;
  const rrInfo = current ? (() => {
    const risk = Math.abs(current.entry - current.sl);
    const reward = Math.abs(current.tp - current.entry);
    const rr = risk > 0 ? reward / risk : 0;
    const tpPct = ((current.tp - current.entry) / current.entry) * 100;
    const slPct = ((current.sl - current.entry) / current.entry) * 100;
    return { rr, tpPct, slPct };
  })() : null;

  return (
  <section style={{ margin: '40px auto 0', maxWidth: 1200, background: 'rgba(30, 27, 75, 0.98)', borderRadius: 18, boxShadow: '0 2px 16px #0002', padding: 24, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
          Operación activa
          {typeof batchMeta?.batchCount === 'number' && (
            <span style={{ marginLeft: 12, background: 'rgba(167,139,250,0.2)', color: '#a78bfa', padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem' }}>
              Lote #{batchMeta.batchCount} • {batchMeta?.batchSignals ?? 0}/2
            </span>
          )}
        </h2>
  {/* Filtro de categorías eliminado para simplificar la vista */}
      </div>

      {/* Selector de operación (máximo 2) */}
      {filteredSignals.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {filteredSignals.map(s => (
            <button key={s.id} onClick={() => onSetActive(s)} style={{ background: current && current.id === s.id ? '#6d28d9' : 'rgba(167,139,250,0.2)', color: current && current.id === s.id ? '#fff' : '#a78bfa', border: '1px solid #6d28d9', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
              {s.display} • {s.signal}
            </button>
          ))}
        </div>
      )}

      {/* Estado Activo/Reserva */}
      {filteredSignals.length > 1 && current && (
        <div style={{ color: '#a5b4fc', fontSize: 12, marginBottom: 8 }}>
          Activo: <b>{current.display}</b> • Reserva: <b>{filteredSignals.find(s => s.id !== current.id)?.display}</b>
        </div>
      )}

      {/* Card compacta: mostrar solo una a la vez, pero conservar hasta 2 */}
      {current ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 16, alignItems: 'start', background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(30,27,75,1) 100%)', border: `2px solid ${current.signal === 'BUY' ? '#22d3ee' : '#f472b6'}`, borderRadius: 14, padding: 16, overflow: 'hidden' }}>
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <div style={{ color: '#e0e7ff', fontWeight: 700, fontSize: '1.1rem' }}>{current.display}</div>
              <div style={{ color: current.signal === 'BUY' ? '#22d3ee' : '#f472b6', fontWeight: 800 }}>{current.signal}</div>
              <div style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>Conf: {current.confidence}%</div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#c7d2fe' }}>
              <div>Entrada: <b>{current.entry}</b></div>
              <div>TP: <b style={{ color: '#16e0b3' }}>{current.tp}</b></div>
              <div>SL: <b style={{ color: '#f472b6' }}>{current.sl}</b></div>
              <div>Hora: <b>{current.timestamp}</b></div>
            </div>
            {rrInfo && (
              <div style={{ color: '#a5b4fc', marginTop: 6 }}>
                RR: <b>{rrInfo.rr.toFixed(2)}</b> • TP <b style={{ color: '#16e0b3' }}>{rrInfo.tpPct >= 0 ? '+' : ''}{rrInfo.tpPct.toFixed(2)}%</b> • SL <b style={{ color: '#f472b6' }}>{rrInfo.slPct.toFixed(2)}%</b>
              </div>
            )}
            <div style={{ color: '#fbbf24', marginTop: 8, fontSize: '0.92rem', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{current.notes}</div>
          </div>
          <div style={{ width: 220, justifySelf: 'end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <button onClick={() => onSetActive(current)} style={{ background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #6d28d955', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={16} /> Ver en gráfico
            </button>
            {remainingMins !== null && (
              <div style={{ color: '#a5b4fc', fontSize: '0.85rem', marginTop: 8, textAlign: 'right' }}>
                Próximo lote en: <b>{remainingMins} min</b>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>Sin operación activa</div>
      )}
    </section>
  );
};

export default SignalsTable;
