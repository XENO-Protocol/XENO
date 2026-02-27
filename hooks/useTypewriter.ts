'use client';
import { useState, useRef, useEffect } from 'react';
export function useTypewriter(text: string, active: boolean, onDone?: () => void): string {
  const [display, setDisplay] = useState('');
  const indexRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => { if (!active || !text) { setDisplay(''); indexRef.current = 0; return; } setDisplay(''); indexRef.current = 0; }, [text, active]);
  useEffect(() => { if (!active || !text) return; if (indexRef.current >= text.length) { onDoneRef.current?.(); return; } const t = setTimeout(() => { indexRef.current += 1; setDisplay(text.slice(0, indexRef.current)); }, 24); return () => clearTimeout(t); }, [active, text, display]);
  return display;
}