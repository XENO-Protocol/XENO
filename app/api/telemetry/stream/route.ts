/**
 * GET /api/telemetry/stream -- Server-Sent Events telemetry endpoint.
 *
 * Provides a Next.js-compatible real-time stream of telemetry data.
 */

import { NextRequest } from 'next/server';
import {
  subscribe,
  startBridge,
  isBridgeActive,
  sampleFrame,
  buildFrameMessage,
} from '@/core/engine/telemetry-bridge';
import type { TelemetryMessage } from '@/types/telemetry';

function validateOrigin(req: NextRequest): boolean {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [];
  if (allowedOrigins.length === 0) return true;
  const origin = req.headers.get('origin') ?? '';
  return allowedOrigins.includes(origin) || origin === '';
}

function validateToken(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  const requiredToken = process.env.TELEMETRY_TOKEN;
  if (!requiredToken) return true;
  const url = new URL(req.url);
  const clientToken = url.searchParams.get('token');
  return clientToken === requiredToken;
}

export async function GET(req: NextRequest) {
  if (!validateOrigin(req)) {
    return new Response('Forbidden: origin not allowed', { status: 403 });
  }
  if (!validateToken(req)) {
    return new Response('Unauthorized: invalid telemetry token', { status: 401 });
  }
  if (!isBridgeActive()) {
    startBridge();
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const initialFrame = sampleFrame();
      const initialMsg = buildFrameMessage(initialFrame);
      controller.enqueue(encoder.encode(formatSSE('frame', initialMsg)));

      const unsubscribe = subscribe((msg: TelemetryMessage) => {
        try {
          controller.enqueue(encoder.encode(formatSSE(msg.type, msg)));
        } catch {
          unsubscribe();
        }
      });

      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(formatSSE('heartbeat', {
            type: 'heartbeat', seq: 0, payload: { status: 'ALIVE' }, timestamp: Date.now(),
          })));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGINS?.split(',')[0] ?? '*',
    },
  });
}

function formatSSE(eventType: string, data: unknown): string {
  return 'event: ' + eventType + '\ndata: ' + JSON.stringify(data) + '\n\n';
}