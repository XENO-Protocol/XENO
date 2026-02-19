import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  messageCount: number;
  connected: boolean;
  latency: number;
}

export default function StatusBar({ messageCount, connected, latency }: StatusBarProps) {
  return (
    <Box paddingX={1} justifyContent="space-between">
      <Box>
        <Text color="gray" dimColor>MSG: </Text>
        <Text color="cyan">{String(messageCount)}</Text>
        <Text color="gray" dimColor> | LATENCY: </Text>
        <Text color={latency > 2000 ? 'red' : 'cyan'}>{String(latency) + 'ms'}</Text>
      </Box>
      <Box>
        <Text color={connected ? 'green' : 'red'}>
          {connected ? '* CONNECTED' : 'o OFFLINE'}
        </Text>
      </Box>
      <Box>
        <Text color="gray" dimColor>XENO_PROTOCOL // ESC to exit</Text>
      </Box>
    </Box>
  );
}