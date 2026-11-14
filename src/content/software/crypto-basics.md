---
minutes: 9
tech: []
refs:
  - seceng: Ch. 5, “Cryptography”
  - owasp: A04, “Cryptographic Failures”
---
Three tools from cryptography appear everywhere in software: **hashing**, **encryption** and **signatures**. They are often confused, and using the wrong one is a common, serious mistake. Each does one job. You will almost never implement them yourself, but you must choose the right one.

## Hashing: a fingerprint

A **hash function** turns any input into a short, fixed-size value, the **hash** or digest. A good cryptographic hash, such as SHA-256, has three properties:

- The same input always gives the same hash.
- A tiny change in the input gives a completely different hash.
- You cannot work backwards from the hash to the input, or find two inputs with the same hash.

Uses:

- **Check that data is unchanged.** Download a file and compare its hash with the published one. Git names every commit by a hash, as [Version control with Git](/lesson/git) explained.
- **Store passwords**, with the special slow, salted algorithms from [Authentication and authorisation](/lesson/auth), not plain SHA-256.

Hashing is one-way. There is no key, and no way to "unhash". It is not encryption.

## Encryption: a lock

**Encryption** turns readable data into unreadable data with a **key**, and the key turns it back. It protects data from people who should not read it.

- **Symmetric** encryption uses one key to lock and unlock. AES is the standard. It is fast, and good for large amounts of data, such as files and database storage. The difficulty is sharing the key safely.
- **Asymmetric** (public-key) encryption uses a pair: a **public key** that anyone may have, and a **private key** that only the owner keeps. Data locked with the public key can only be unlocked with the private key. It is slower, and solves the key-sharing problem.

HTTPS uses both: public-key cryptography to agree on a fresh symmetric key, then fast symmetric encryption for the rest, as in [What happens when you open a page](/lesson/open-a-page).

Encrypt data **in transit** (HTTPS everywhere, including between your own services) and **at rest** (disks, databases, backups).

## Signatures: a seal

A **digital signature** proves who created some data and that nobody changed it. The signer uses their **private key**; anyone can check the signature with the matching **public key**.

Uses: TLS certificates, signed app builds (as in [Releasing to the app stores](/lesson/app-release)), software updates, and tokens such as JWTs, whose signature the server checks before it trusts the contents.

A signature does not hide the data. A signed JWT can be read by anyone who has it. Do not put secrets in it.

## Which one?

| Need | Tool |
|---|---|
| Check that data has not changed | Hash, or a signature if you must also know who made it |
| Store a password | A slow password hash: Argon2, bcrypt, scrypt |
| Keep data secret | Encryption |
| Prove who sent it | Signature |

> **Pitfall.** Never write your own cryptography, and never invent your own way of combining these tools. Use well-known libraries and standard protocols, such as TLS and libsodium, with their default settings.

## Remember

- Hashing makes a one-way fingerprint. It has no key and cannot be reversed.
- Encryption hides data with a key. Symmetric is fast; public-key solves sharing keys.
- Signatures prove who made data and that it is unchanged. They do not hide it.
- Use standard libraries and protocols. Never invent your own.

::quiz
? A developer "encrypts" passwords with SHA-256. What is wrong?
+ SHA-256 is a fast hash, not encryption, and is too fast for passwords: use Argon2 or bcrypt
- Nothing
- SHA-256 can be reversed with the key
! A fast hash lets attackers test billions of guesses. Password hashing must be slow and salted.
? Can anyone who holds a signed JWT read its contents?
+ Yes: the signature proves who made it, but does not hide it
- No: signatures encrypt the data
- Only the server
! Signing and encrypting are different jobs. Do not put secrets in a signed token.
::end
