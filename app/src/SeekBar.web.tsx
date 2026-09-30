import { useRef } from 'react';
import type { SeekBarProps } from './SeekBar.types';
import { colors } from './theme';
export default function SeekBar(p: SeekBarProps) {
  const dragging = useRef(false);
  return <input type="range" aria-label="播放進度" min={0} max={p.maximum || 1} step={0.1} value={p.value} disabled={p.disabled}
    style={{ width: '100%', height: 44, margin: 0, accentColor: colors.accent, touchAction: 'none', cursor: p.disabled ? 'default' : 'pointer' }}
    onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); p.onPreview(Number(e.currentTarget.value)); }}
    onChange={e => { const value = Number(e.currentTarget.value); if (dragging.current) p.onPreview(value); else p.onCommit(value); }}
    onPointerUp={e => { dragging.current = false; p.onCommit(Number(e.currentTarget.value)); }}
    onPointerCancel={() => { dragging.current = false; p.onCancel(); }} />;
}
