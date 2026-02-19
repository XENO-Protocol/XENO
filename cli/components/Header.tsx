import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  fingerprint: string | null;
  mode: string;
}

const ASCII_LOGO = [
  ' __  __ _____ _   _  ___  ',
  ' \\ \\/ /| ____| \\ | |/ _ \\ ',
  '  >  < |  _| |  \\| | | | |',
  ' / /\\ \\| |___| |\\  | |_| |',
  '/_/  \\_\\_____|_| \\_|\\___/ ',
];

export default function Header({ fingerprint, mode }: HeaderProps) {
  const isSovereign = mode === 'SOVEREIGN';
  const statusChar = isSovereign ? '#' : '!';
  const statusLabel = isSovereign ? 'SOVEREIGN' : 'RESTRICTED';
  const fp = fingerprint || '----------------';

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column" alignItems="center">
        {ASCII_LOGO.map((line, i) => (
          <Text key={i} color="cyan" bold>{line}</Text>
        ))}
      </Box>
      <Box justifyContent="center" marginTop={1}>
        <Text color="cyan" dimColor>{'----------------------------------------------------'}</Text>
      </Box>
      <Box justifyContent="center">
        <Text color={isSovereign ? 'cyan' : 'red'} bold>
          {' [' + statusChar + '] ' + statusLabel + ' '}
        </Text>
        <Text color="gray">{' | '}</Text>
        <Text color="cyan" dimColor>{'FP: ' + fp}</Text>
        <Text color="gray">{' | '}</Text>
        <Text color="cyan" dimColor>HARDENED SYNTHETIC SENTIENCE</Text>
      </Box>
      <Box justifyContent="center">
        <Text color="cyan" dimColor>{'----------------------------------------------------'}</Text>
      </Box>
    </Box>
  );
}