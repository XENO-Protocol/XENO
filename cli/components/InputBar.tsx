import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface InputBarProps {
  onSubmit: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSubmit, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const [cursorOn, setCursorOn] = useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => { setCursorOn((v) => !v); }, 530);
    return () => clearInterval(interval);
  }, []);

  useInput((input, key) => {
    if (disabled) return;
    if (key.return) {
      const trimmed = value.trim();
      if (trimmed.length > 0) { onSubmit(trimmed); setValue(''); }
      return;
    }
    if (key.backspace || key.delete) { setValue((v) => v.slice(0, -1)); return; }
    if (input && !key.ctrl && !key.meta) { setValue((v) => v + input); }
  });

  const cursor = cursorOn ? '_' : ' ';
  const prompt = disabled ? '[PROCESSING...]' : '[HOST]>';

  return (
    <Box borderStyle="single" borderColor={disabled ? 'gray' : 'cyan'} paddingX={1}>
      <Text color={disabled ? 'gray' : 'cyan'} bold>{prompt + ' '}</Text>
      <Text color="white">{value}</Text>
      <Text color="cyan">{disabled ? '' : cursor}</Text>
    </Box>
  );
}