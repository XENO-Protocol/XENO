# SECURITY POLICY

## Supported Versions

| Version       | Status     |
| :------------ | :--------- |
| 0.1.x-alpha   | Supported  |
| < 0.1.0       | Unsupported|

---

## Reporting a Vulnerability

XENO_PROTOCOL takes security defects seriously. If you discover a vulnerability in this repository, **do not open a public issue**. Responsible disclosure is mandatory.

### Disclosure Process

1. **Submit via encrypted channel.** Send a detailed report to the maintainer via GitHub Security Advisories (preferred) or direct encrypted email. If you require a PGP key, request one through the X account linked in the repository.

2. **Include the following in your report:**
   - Affected component (file path, endpoint, module).
   - Steps to reproduce the vulnerability.
   - Potential impact assessment (data exposure, privilege escalation, denial of service).
   - Suggested remediation, if available.

3. **Response timeline:**
   - **Acknowledgment:** Within 48 hours of receipt.
   - **Triage and severity classification:** Within 5 business days.
   - **Patch release (if confirmed):** Within 14 business days for critical severity; 30 business days for moderate.

4. **Do not** publicly disclose the vulnerability until a patch has been released and confirmed, or until 90 days have elapsed since the initial report -- whichever comes first.

---

## Scope

The following components are in scope for security reports:

- API route handlers (`app/api/**`)
- Environment variable handling and secret management
- Memory persistence layer (`core/memory/`)
- Authentication and transport security configurations
- Dependency supply-chain vulnerabilities

The following are **out of scope**:

- Mock data generators (`core/engine/hunter.ts`, `core/engine/stream.ts`) -- these produce deterministic test data and handle no real user input in production.
- Frontend rendering bugs that do not involve data leakage or injection.
- Social engineering attacks against contributors.

---

## Cryptographic Standards (Target)

| Domain                | Specification                          |
| :-------------------- | :------------------------------------- |
| Transport             | TLS 1.3 enforced, HSTS preload        |
| Secrets Storage       | Vault-backed injection (target)        |
| Data at Rest          | AES-256-GCM (target)                  |
| Fragment Integrity    | SHA-256 HMAC per MemoryFragment (target) |
| SSH Authentication    | Ed25519 mandatory                     |

---

## Attribution

We acknowledge all valid vulnerability reporters in our release notes unless anonymity is requested.

This policy is effective as of Revision 0.1.5-Alpha.