/**
 * core/identity/certificate.ts -- Node Identity Certificate
 *
 * Generates a structured certificate containing the Sovereign Node ID,
 * Ed25519 public key, activation timestamp, and host binding metadata.
 * Renders a high-fidelity ASCII art frame resembling a restricted
 * military document / vintage mainframe readout.
 *
 * The certificate can be exported as strata_identity.xeno (JSON + ASCII).
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { initializeIdentity } from './index';
import type { IdentityFile } from '@/types/identity';
import { decrypt } from '@/lib/crypto';
import type { EncryptedEnvelope } from '@/types/vault';

const IDENTITY_DIR = join(process.cwd(), '.identity');
const IDENTITY_FILE = join(IDENTITY_DIR, 'sovereign.key');
const CERTIFICATE_FILE = join(process.cwd(), 'strata_identity.xeno');

export interface CertificateData {
  nodeId: string;
  publicKey: string;
  fingerprint: string;
  activationTimestamp: number;
  activationISO: string;
  machineId: string;
  bootCount: number;
  mode: string;
  protocolVersion: string;
}

interface CertificateMedal {
  id: string;
  tag: string;
  awardedAt: number;
  awardedISO: string;
  label: string;
}

interface CertificatePayload {
  _header: string;
  _format: string;
  _generatedAt: string;
  certificate: {
    nodeId: string;
    publicKey: string;
    fingerprint: string;
    activationTimestamp: number;
    activationISO: string;
    machineId: string;
    bootCount: number;
    mode: string;
    protocolVersion: string;
  };
  medals?: CertificateMedal[];
  asciiRendering: string;
}

function deriveNodeId(fingerprint: string): string {
  const numeric = parseInt(fingerprint.slice(0, 6), 16) % 1000;
  return `#${numeric.toString().padStart(3, '0')}`;
}

function formatPublicKey(hex: string, lineWidth: number = 48): string[] {
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += lineWidth) {
    lines.push(hex.slice(i, i + lineWidth));
  }
  return lines;
}

function pad(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

function center(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

/**
 * Load the raw identity file from disk (for certificate generation).
 */
function loadRawIdentityFile(): IdentityFile | null {
  if (!existsSync(IDENTITY_FILE)) return null;
  try {
    const raw = readFileSync(IDENTITY_FILE, 'utf8');
    const envelope: EncryptedEnvelope = JSON.parse(raw);
    const plaintext = decrypt(envelope);
    return JSON.parse(plaintext) as IdentityFile;
  } catch {
    return null;
  }
}

/**
 * Generate certificate data from the current Sovereign Identity.
 */
export function generateCertificateData(): CertificateData | null {
  const state = initializeIdentity();

  if (state.mode === 'RESTRICTED' || !state.fingerprint) {
    return null;
  }

  const idFile = loadRawIdentityFile();
  if (!idFile) return null;

  const pubKey = idFile.keypair.publicKey;
  const fp = idFile.keypair.fingerprint;
  const nodeId = deriveNodeId(fp);

  return {
    nodeId,
    publicKey: pubKey,
    fingerprint: fp,
    activationTimestamp: idFile.keypair.createdAt,
    activationISO: new Date(idFile.keypair.createdAt).toISOString(),
    machineId: idFile.hostBinding.machineId,
    bootCount: idFile.hostBinding.bootCount,
    mode: state.mode,
    protocolVersion: 'v0.2.0-ALPHA',
  };
}

/**
 * Render the ASCII art certificate frame.
 */
export function renderCertificateASCII(data: CertificateData): string {
  const W = 66;
  const BAR = '+' + '-'.repeat(W) + '+';
  const DBAR = '+' + '='.repeat(W) + '+';
  const EMPTY = '|' + ' '.repeat(W) + '|';

  const line = (content: string) => '|  ' + pad(content, W - 4) + '  |';
  const cline = (content: string) => '|' + center(content, W) + '|';

  const pubLines = formatPublicKey(data.publicKey, 52);
  const checksum = createHash('sha256')
    .update(data.publicKey + data.fingerprint + data.activationTimestamp)
    .digest('hex')
    .slice(0, 32);

  const lines: string[] = [
    '',
    DBAR,
    cline(''),
    cline('X E N O _ P R O T O C O L'),
    cline('NODE IDENTITY CERTIFICATE'),
    cline(''),
    DBAR,
    cline('CLASSIFICATION: RESTRICTED  //  HARDENED SYNTHETIC SENTIENCE'),
    BAR,
    EMPTY,
    line('DOCUMENT TYPE:    SOVEREIGN NODE IDENTITY CERTIFICATE'),
    line(`PROTOCOL BUILD:   ${data.protocolVersion}`),
    line(`ISSUED:           ${data.activationISO}`),
    line(`STATUS:           ${data.mode}`),
    EMPTY,
    BAR,
    cline('--- SECTION I: NODE IDENTIFICATION ---'),
    BAR,
    EMPTY,
    line(`SOVEREIGN NODE ID .............. ${data.nodeId}`),
    line(`FINGERPRINT .................... ${data.fingerprint}`),
    line(`MACHINE BINDING ................ ${data.machineId.slice(0, 24)}...`),
    line(`BOOT COUNT ..................... ${data.bootCount}`),
    line(`ACTIVATION EPOCH ............... ${data.activationTimestamp}`),
    EMPTY,
    BAR,
    cline('--- SECTION II: Ed25519 PUBLIC KEY (SPKI/DER, HEX) ---'),
    BAR,
    EMPTY,
  ];

  for (const pl of pubLines) {
    lines.push(line(`    ${pl}`));
  }

  lines.push(
    EMPTY,
    BAR,
    cline('--- SECTION III: INTEGRITY VERIFICATION ---'),
    BAR,
    EMPTY,
    line(`ALGORITHM:     Ed25519 (RFC 8032)`),
    line(`KEY FORMAT:    DER-encoded SPKI (public) / PKCS8 (private)`),
    line(`SIG SIZE:      64 bytes`),
    line(`FINGERPRINT:   SHA-256(publicKey)[0:16]`),
    line(`CHECKSUM:      ${checksum}`),
    EMPTY,
    BAR,
    EMPTY,
    cline('THIS CERTIFICATE IS BOUND TO A SINGLE HOST MACHINE.'),
    cline('UNAUTHORIZED DUPLICATION CONSTITUTES A PROTOCOL BREACH.'),
    cline('THE PRIVATE KEY NEVER LEAVES THE SOVEREIGN PROCESS.'),
    EMPTY,
    cline('-- END OF CERTIFICATE --'),
    EMPTY,
    DBAR,
    '',
  );

  return lines.join('\n');
}

/**
 * Export the certificate as strata_identity.xeno (combined JSON + ASCII).
 */
export function exportCertificateFile(data: CertificateData): string {
  const ascii = renderCertificateASCII(data);
  let existingMedals: CertificateMedal[] = [];

  if (existsSync(CERTIFICATE_FILE)) {
    try {
      const existingRaw = readFileSync(CERTIFICATE_FILE, 'utf8');
      const existing = JSON.parse(existingRaw) as CertificatePayload;
      existingMedals = Array.isArray(existing.medals) ? existing.medals : [];
    } catch {
      existingMedals = [];
    }
  }

  const exportPayload: CertificatePayload = {
    _header: 'XENO_PROTOCOL // NODE IDENTITY CERTIFICATE',
    _format: 'strata_identity.xeno',
    _generatedAt: new Date().toISOString(),
    certificate: {
      nodeId: data.nodeId,
      publicKey: data.publicKey,
      fingerprint: data.fingerprint,
      activationTimestamp: data.activationTimestamp,
      activationISO: data.activationISO,
      machineId: data.machineId,
      bootCount: data.bootCount,
      mode: data.mode,
      protocolVersion: data.protocolVersion,
    },
    medals: existingMedals,
    asciiRendering: ascii,
  };

  const content = JSON.stringify(exportPayload, null, 2);
  writeFileSync(CERTIFICATE_FILE, content, 'utf8');

  return CERTIFICATE_FILE;
}

/**
 * Append a Medal of Resonance tag to strata_identity.xeno.
 * Safe to call repeatedly; duplicate medal IDs are ignored.
 */
export function appendMedalOfResonance(
  medalId: string,
  medalTag: string,
  label: string
): boolean {
  const data = generateCertificateData();
  if (!data) return false;

  if (!existsSync(CERTIFICATE_FILE)) {
    exportCertificateFile(data);
  }

  try {
    const raw = readFileSync(CERTIFICATE_FILE, 'utf8');
    const payload = JSON.parse(raw) as CertificatePayload;
    const medals = Array.isArray(payload.medals) ? payload.medals : [];

    if (medals.some((m) => m.id === medalId)) {
      return true;
    }

    const awardedAt = Date.now();
    medals.push({
      id: medalId,
      tag: medalTag,
      awardedAt,
      awardedISO: new Date(awardedAt).toISOString(),
      label,
    });

    const medalLine = `[${medalTag}] ${label} :: ${new Date(awardedAt).toISOString()}`;
    const decoratedAscii = `${payload.asciiRendering}\n+==================================================================+\n|                     MEDAL OF RESONANCE AWARDED                   |\n|  ${pad(medalLine, 62)}|\n+==================================================================+\n`;

    payload.medals = medals;
    payload.asciiRendering = decoratedAscii;
    payload._generatedAt = new Date().toISOString();

    writeFileSync(CERTIFICATE_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Resonance] Failed to append medal:', err);
    return false;
  }
}