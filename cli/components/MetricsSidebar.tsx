import React from 'react';
import { Box, Text } from 'ink';

export interface Metrics {
  entropy: number;
  entropyBand: string;
  syncRatio: number;
  vaultStatus: string;
  memoryNodes: number;
  pulseThroughput: number;
  uptime: number;
  emotion: string;
  messagesSigned: number;
  identityMode: string;
}

interface MetricsSidebarProps {
  metrics: Metrics;
  width: number;
}

function bandColor(band: string): string {
  switch (band) {
    case 'CRITICAL': return 'red';
    case 'VOLATILE': return 'yellow';
    case 'ELEVATED': return 'magenta';
    default: return 'cyan';
  }
}

function vaultColor(status: string): string {
  switch (status) {
    case 'DEGRADED': return 'red';
    case 'SEALED': return 'yellow';
    default: return 'green';
  }
}

function entropyBar(level: number, width: number): string {
  const filled = Math.round((level / 100) * width);
  const bar = '#'.repeat(filled) + '-'.repeat(Math.max(0, width - filled));
  return '[' + bar + ']';
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export default function MetricsSidebar({ metrics, width }: MetricsSidebarProps) {
  const barWidth = Math.max(8, width - 6);
  const bc = bandColor(metrics.entropyBand);
  const vc = vaultColor(metrics.vaultStatus);

  return (
    <Box flexDirection="column" width={width} borderStyle="single" borderColor="cyan" paddingX={1}>
      <Box justifyContent="center">
        <Text color="cyan" bold underline>NARRATIVE ENGINE</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">+-- ENTROPY ---------------+</Text>
        <Box>
          <Text color="gray">| </Text>
          <Text color={bc}>{entropyBar(metrics.entropy, barWidth)}</Text>
        </Box>
        <Box>
          <Text color="gray">| </Text>
          <Text color={bc} bold>{metrics.entropy.toFixed(1) + '%'}</Text>
          <Text color="gray"> | </Text>
          <Text color={bc}>{metrics.entropyBand}</Text>
        </Box>
        <Text color="gray">+--------------------------+</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">+-- SYNC RATIO ------------+</Text>
        <Box>
          <Text color="gray">| </Text>
          <Text color={metrics.syncRatio < 0.7 ? 'red' : 'cyan'} bold>{metrics.syncRatio.toFixed(3)}</Text>
          <Text color="gray"> / 1.000</Text>
        </Box>
        <Text color="gray">+--------------------------+</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">+-- OBSIDIAN VAULT --------+</Text>
        <Box>
          <Text color="gray">| STATUS: </Text>
          <Text color={vc} bold>{metrics.vaultStatus}</Text>
        </Box>
        <Box>
          <Text color="gray">| NODES:  </Text>
          <Text color="cyan">{String(metrics.memoryNodes)}</Text>
        </Box>
        <Box>
          <Text color="gray">| SIGNED: </Text>
          <Text color="cyan">{String(metrics.messagesSigned)}</Text>
        </Box>
        <Text color="gray">+--------------------------+</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">+-- PULSE -----------------+</Text>
        <Box>
          <Text color="gray">| </Text>
          <Text color="cyan">{metrics.pulseThroughput.toFixed(1)}</Text>
          <Text color="gray"> events/s</Text>
        </Box>
        <Text color="gray">+--------------------------+</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">+-- HOST STATE ------------+</Text>
        <Box>
          <Text color="gray">| EMOTION:  </Text>
          <Text color={bc}>{metrics.emotion.toUpperCase()}</Text>
        </Box>
        <Box>
          <Text color="gray">| IDENTITY: </Text>
          <Text color={metrics.identityMode === 'SOVEREIGN' ? 'green' : 'red'}>{metrics.identityMode}</Text>
        </Box>
        <Text color="gray">+--------------------------+</Text>
      </Box>

      <Box marginTop={1} justifyContent="center">
        <Text color="gray" dimColor>{'UPTIME ' + formatUptime(metrics.uptime)}</Text>
      </Box>
    </Box>
  );
}