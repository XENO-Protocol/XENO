#!/usr/bin/env npx tsx
/**
 * cli/index.tsx -- XENO_PROTOCOL CLI Terminal Interface
 *
 * High-fidelity terminal UI built with ink (React for CLI).
 * Split-screen layout: dialogue stream + real-time metrics sidebar.
 *
 * Usage:
 *   npm run cli                    # Interactive terminal
 *   npm run cli -- --identity      # Display Node Identity Certificate
 *   npx tsx cli/index.tsx
 *
 * Requirements:
 *   - Node.js 20+
 *   - Optional: OPENAI_API_KEY for full LLM synthesis
 *   - Optional: Next.js dev server running for API mode
 */

import React from 'react';
import { render } from 'ink';
import App from './app.js';

const args = process.argv.slice(2);

if (args.includes('--identity')) {
  import('./commands/identity.js').then(({ runIdentityCommand }) => {
    runIdentityCommand().then(() => process.exit(0));
  });
} else {
  console.clear();

  const { waitUntilExit } = render(React.createElement(App));

  waitUntilExit().then(() => {
    console.log('\n[XENO] Protocol terminated. The abyss remembers.\n');
    process.exit(0);
  });
}