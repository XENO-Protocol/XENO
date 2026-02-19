#!/usr/bin/env npx tsx
/**
 * cli/index.tsx -- XENO_PROTOCOL CLI Terminal Interface
 *
 * Usage: npm run cli
 */

import React from 'react';
import { render } from 'ink';
import App from './app.js';

console.clear();

const { waitUntilExit } = render(React.createElement(App));

waitUntilExit().then(() => {
  console.log('\n[XENO] Protocol terminated. The abyss remembers.\n');
  process.exit(0);
});