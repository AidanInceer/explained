---
minutes: 7
tech: []
refs:
  - twelve: III, “Config”
  - owasp: A02, “Cryptographic Failures”, and A05, “Security Misconfiguration”
---
A **secret** is anything that grants access: a database password, an API key, a signing key, a token for a cloud account. Whoever holds it can act as your system. Secrets leak in boring ways: committed to Git, printed in a log, pasted in a chat, left in an old laptop's files. Handling them well is mostly discipline.

## Never in the code

A secret in source code is shared with everyone who can read the repository, every fork, every laptop with a clone, and every backup, for ever. Removing it in a later commit does not remove it from history.

Bots scan public repositories for keys within minutes of a push. A leaked cloud key can run up a large bill in hours.

> **Pitfall.** If a secret was ever committed, treat it as leaked. **Rotate** it: create a new one, switch the system to it, and revoke the old one. Cleaning history is not enough.

## Where secrets live

- **In development**: a local `.env` file that is listed in `.gitignore`, with a committed `.env.example` that shows the names but not the values.
- **In production**: a **secrets manager**, such as AWS Secrets Manager, Google Secret Manager, Azure Key Vault or HashiCorp Vault. It stores secrets encrypted, controls who may read each one, logs every read, and can rotate them.
- **Given to the program** at start-up through environment variables or a mounted file, as the lesson on environments and configuration explains.

## Never in logs

Logs are copied to many places and read by many people. Make sure secrets and personal data never reach them:

- Do not log whole requests, headers or configuration objects.
- Mask fields such as `password`, `token` and `authorization` in your logging setup.
- Be careful with error messages that include a connection string.

## Scan automatically

- Turn on **secret scanning** in your Git host, and a pre-commit hook that blocks commits containing keys.
- Many providers detect their own keys in public repositories and revoke them, but do not rely on it.

## Fewer, shorter-lived secrets

The best secret is one that does not exist:

- Cloud services can give a running program an **identity** with permissions, so it needs no stored key at all.
- Prefer **short-lived tokens** that expire in minutes or hours over keys that last for years.
- Give each service its own credentials, with [least privilege](/lesson/least-privilege), so one leak opens one door.

## Remember

- Secrets grant access. Never put them in code, and treat any committed secret as leaked: rotate it.
- Use `.env` locally and a secrets manager in production.
- Keep secrets and personal data out of logs.
- Scan for leaks, and prefer identities and short-lived tokens to long-lived keys.

::quiz
? An API key was committed last month and removed in a later commit. What should you do?
+ Rotate the key: issue a new one and revoke the old one
- Nothing: it is no longer in the code
- Make the repository private
! The key is still in history and may already be copied. Only rotation makes it useless.
? Where should a production database password be kept?
+ In a secrets manager, given to the service at start-up
- In the source code, in a constants file
- In the README
! A secrets manager encrypts, controls and logs access, and supports rotation.
::end
