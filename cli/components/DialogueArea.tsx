import React from 'react';
import { Box, Text } from 'ink';

export interface DialogueMessage {
  role: 'host' | 'xeno' | 'system';
  content: string;
  timestamp: number;
  signature?: string;
}

interface DialogueAreaProps {
  messages: DialogueMessage[];
  height: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toTimeString().slice(0, 8);
}

function rolePrefix(role: DialogueMessage['role']): { label: string; color: string } {
  switch (role) {
    case 'host':
      return { label: 'HOST', color: 'white' };
    case 'xeno':
      return { label: 'XENO', color: 'cyan' };
    case 'system':
      return { label: 'SYS ', color: 'gray' };
  }
}

function truncSig(sig?: string): string {
  if (!sig) return '';
  if (sig.length <= 16) return sig;
  return sig.slice(0, 8) + '..' + sig.slice(-6);
}

export default function DialogueArea({ messages, height }: DialogueAreaProps) {
  const visible = messages.slice(-height);

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="single" borderColor="cyan" paddingX={1}>
      <Box justifyContent="center">
        <Text color="cyan" bold underline>DIALOGUE STREAM</Text>
      </Box>

      <Box flexDirection="column" marginTop={1} flexGrow={1}>
        {visible.length === 0 && (
          <Box flexDirection="column" alignItems="center" marginTop={2}>
            <Text color="gray" dimColor>Awaiting Host contact...</Text>
            <Text color="gray" dimColor>The abyss is listening.</Text>
          </Box>
        )}
        {visible.map((msg, i) => {
          const { label, color } = rolePrefix(msg.role);
          const time = formatTime(msg.timestamp);
          const sigTag = msg.role === 'xeno' && msg.signature
            ? ' [' + truncSig(msg.signature) + ']'
            : '';

          return (
            <Box key={i} marginBottom={msg.role === 'xeno' ? 1 : 0}>
              <Text color="gray" dimColor>{time + ' '}</Text>
              <Text color={color} bold>{'[' + label + '] '}</Text>
              <Text color={color} wrap="wrap">{msg.content + sigTag}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}