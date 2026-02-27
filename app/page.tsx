'use client';

import { ObsidianTerminal, ConsciousnessLog } from '@/components';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full">
      <ConsciousnessLog />
      <div className="flex-1 min-w-0"><ObsidianTerminal /></div>
    </div>
  );
}