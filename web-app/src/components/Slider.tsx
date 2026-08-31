import { useCallback, useRef } from 'react';
import type { ParamDef } from '../engine/ops';
import { useEditor } from '../state/store';

/** Compact labelled slider with numeric display + double-click reset. */
export function Slider({ opId, param, value, live }: {
  opId: string;
  param: ParamDef;
  value: number;
  live?: boolean; // during drag styling
}) {
  const { dispatch } = useEditor();
  const { min, max, step = 0.01, def } = param;
  const dragging = useRef(false);

  const set = useCallback((v: number) => {
    const rounded = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, Number(rounded.toFixed(4))));
    dispatch({ type: 'SET_PARAM', opId, key: param.key, value: clamped });
  }, [dispatch, opId, param.key, min, max, step]);

  const display = param.unit === '°' ? `${value.toFixed(0)}°`
    : param.unit === 'EV' ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
    : param.unit === 'px' ? `${value.toFixed(1)}`
    : `${value.toFixed(2)}`;

  return (
    <div className="slider-row" data-live={live || undefined}>
      <div className="slider-label" title={param.label}>{param.label}</div>
      <input
        className="slider"
        type="range"
        min={min} max={max} step={step}
        value={value}
        onPointerDown={() => {
          if (!dragging.current) {
            dragging.current = true;
            dispatch({ type: 'BEGIN_EDIT' });
          }
        }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
        onChange={(e) => {
          if (!dragging.current) dispatch({ type: 'BEGIN_EDIT' }); // keyboard / programmatic
          set(Number(e.target.value));
        }}
        onDoubleClick={() => { dispatch({ type: 'BEGIN_EDIT' }); set(def); }}
        aria-label={param.label}
      />
      <div
        className="slider-value"
        title="Double-click to reset"
        onDoubleClick={() => { dispatch({ type: 'BEGIN_EDIT' }); set(def); }}
      >
        {display}
      </div>
    </div>
  );
}
