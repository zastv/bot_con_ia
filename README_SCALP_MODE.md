# Modo Scalp Adaptativo

Este proyecto ahora incluye un modo de scalping más rápido y con gestión activa.

## Qué cambia
- SL/TP cortos por defecto:
  - TP ≈ 0.25–0.45%
  - SL ≈ 0.18–0.28%
- Break-even rápido a +0.15% (`BE_TRIGGER`).
- Trailing lock a +0.30% (`TRAIL_TRIGGER`) asegurando ≈0.10% (`TRAIL_LOCK`).
- Expiración automática a los 5 minutos (`SCALP_MAX_DURATION_MS`).
- Cancelación temprana si se mueve −0.15–0.20% en contra (`ADVERSE_TRIGGER`).
- Adaptación simple según el rendimiento reciente (últimas 12): si baja el winrate, se hace más conservador y exige más confianza.

## Dónde ajustar
Edita `src/hooks/useSignalGeneration.ts` (línea aproximada donde se declaran):
- `SCALP_MAX_DURATION_MS`
- `BE_TRIGGER`, `TRAIL_TRIGGER`, `TRAIL_LOCK`
- `ADVERSE_TRIGGER` (se recalibra según winrate)
- `MIN_CONFIDENCE_OPEN`
- Porcentajes `PCT_TP`/`PCT_SL` (se recalibran con winrate)

## Uso
- El hook ya respeta `signalInterval` (ms) para la cadencia de chequeo/generación.
- Se permite operar cualquier par de `selectedPairs` definido en `TradingSignalsBot.tsx` y `src/data/tradingPairs.ts`.
- Se mantiene la regla de 1 operación activa simultánea.

## Consejos
- Para sobre-lotaje en cuentas pequeñas, usa `balance` y `riskPct` en el componente `ActiveTrade` como referencia de tamaño. Ajusta `riskPct` con criterio.
- En `src/data/tradingPairs.ts` agrega más pares si lo necesitas.
- Revisa el `Historial` y el `Flujo de operaciones` para entender por qué cierra (TP/SL/EXPIRED/CANCELLED) y cómo se adapta.
