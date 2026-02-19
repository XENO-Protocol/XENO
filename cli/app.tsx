import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useApp, useInput, useStdout } from 'ink';
import Header from './components/Header.js';
import DialogueArea, { type DialogueMessage } from './components/DialogueArea.js';
import MetricsSidebar, { type Metrics } from './components/MetricsSidebar.js';
import InputBar from './components/InputBar.js';
import StatusBar from './components/StatusBar.js';

import { initializeIdentity, signResponse, getIdentityState, isSovereign, getFingerprint } from '../core/identity/index.js';
import { calculateHostEntropy, type EmotionTag } from '../core/brain/index.js';
import { recordInteraction, getVaultHistorySummary, getInteractionCount } from '../core/vault/index.js';
import { sampleFrame, updateEntropy, updateMemoryNodes, startBridge, isBridgeActive } from '../core/engine/telemetry-bridge.js';

const SIDEBAR_WIDTH = 30;

const DEFAULT_METRICS: Metrics = {
  entropy: 0,
  entropyBand: 'STABLE',
  syncRatio: 1.0,
  vaultStatus: 'ACTIVE',
  memoryNodes: 0,
  pulseThroughput: 0,
  uptime: 0,
  emotion: 'neutral',
  messagesSigned: 0,
  identityMode: 'RESTRICTED',
};

export default function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const termHeight = stdout?.rows ?? 40;
  const dialogueHeight = Math.max(8, termHeight - 14);

  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(DEFAULT_METRICS);
  const [processing, setProcessing] = useState(false);
  const [latency, setLatency] = useState(0);
  const [recentEmotions] = useState<EmotionTag[]>([]);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const idState = initializeIdentity();
    if (!isBridgeActive()) startBridge({ intervalMs: 1000 });
    setMetrics((prev) => ({ ...prev, identityMode: idState.mode }));
    const bootMsg: DialogueMessage = {
      role: 'system',
      content: '[BOOT] Sovereign Identity: ' + idState.mode + ' | Fingerprint: ' + (idState.fingerprint || 'N/A') + ' | Narrative Engine: ONLINE',
      timestamp: Date.now(),
    };
    setMessages([bootMsg]);
    setBooted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const frame = sampleFrame();
      const idState = getIdentityState();
      setMetrics((prev) => ({
        entropy: frame.entropy_level,
        entropyBand: frame.entropy_band,
        syncRatio: frame.sync_ratio,
        vaultStatus: frame.vault_status,
        memoryNodes: frame.active_memory_nodes,
        pulseThroughput: frame.pulse_throughput,
        uptime: frame.uptime_seconds,
        emotion: prev.emotion,
        messagesSigned: idState.messagesSigned,
        identityMode: idState.mode,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useInput((_input, key) => {
    if (key.escape) exit();
  });

  const handleSubmit = useCallback(async (input: string) => {
    if (processing) return;
    setProcessing(true);
    const startTime = Date.now();

    const hostMsg: DialogueMessage = { role: 'host', content: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, hostMsg]);

    try {
      const entropy = calculateHostEntropy(input, recentEmotions);
      recentEmotions.push(entropy.emotion);
      if (recentEmotions.length > 8) recentEmotions.shift();

      updateEntropy(entropy.score, entropy.band);
      setMetrics((prev) => ({
        ...prev, entropy: entropy.score * 100, entropyBand: entropy.band, emotion: entropy.emotion,
      }));

      let responseContent: string;
      let signature: string | undefined;

      if (process.env.OPENAI_API_KEY) {
        try {
          const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
          });
          if (res.ok) {
            const data = await res.json();
            responseContent = data.content;
            signature = data.identity?.signature;
          } else {
            const env = signResponse('[Entropy: ' + entropy.band + '] The abyss processes your input. Sync ratio nominal. Host state: ' + entropy.emotion + '.');
            responseContent = env.content;
            signature = env.signature;
          }
        } catch {
          const env = signResponse('[Entropy: ' + entropy.band + '] API unreachable. Local synthesis active. Host state: ' + entropy.emotion + '.');
          responseContent = env.content;
          signature = env.signature;
        }
      } else {
        const env = signResponse('[LOCAL] Entropy: ' + (entropy.score * 100).toFixed(1) + '% | Band: ' + entropy.band + ' | State: ' + entropy.emotion + '. Set OPENAI_API_KEY for full synthesis.');
        responseContent = env.content;
        signature = env.signature;
      }

      try {
        recordInteraction(input, responseContent, entropy);
        updateMemoryNodes(getInteractionCount());
      } catch { /* vault failure is non-fatal */ }

      setLatency(Date.now() - startTime);

      const xenoMsg: DialogueMessage = { role: 'xeno', content: responseContent, timestamp: Date.now(), signature: signature || undefined };
      setMessages((prev) => [...prev, xenoMsg]);
    } catch (err) {
      const errMsg: DialogueMessage = { role: 'system', content: '[ERROR] ' + (err instanceof Error ? err.message : 'Unknown failure'), timestamp: Date.now() };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setProcessing(false);
    }
  }, [processing, recentEmotions]);

  if (!booted) {
    return (
      <Box flexDirection="column" alignItems="center" marginTop={2}>
        <Text color="cyan">Initializing XENO_PROTOCOL...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={termHeight}>
      <Header fingerprint={getFingerprint()} mode={metrics.identityMode} />
      <Box flexGrow={1}>
        <DialogueArea messages={messages} height={dialogueHeight} />
        <MetricsSidebar metrics={metrics} width={SIDEBAR_WIDTH} />
      </Box>
      <InputBar onSubmit={handleSubmit} disabled={processing} />
      <StatusBar messageCount={messages.filter((m) => m.role === 'host').length} connected={isSovereign()} latency={latency} />
    </Box>
  );
}