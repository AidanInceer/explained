---
minutes: 9
tech: []
refs:
  - owasp: A01, “Broken Access Control”, and A07, “Identification and Authentication Failures”
  - seceng: Ch. 6, “Access Control”
---
Two questions sit in front of every action in a system. **Authentication**: who are you? **Authorisation**: may you do this? They are different questions, answered by different code, and confusing them is one of the most common causes of security failures.

## Authentication: who are you?

The user proves who they are with one or more **factors**:

- Something they **know**: a password.
- Something they **have**: a phone that receives a code, or a security key.
- Something they **are**: a fingerprint or face, usually unlocking a key on their device.

Using two factors (**MFA**, multi-factor authentication) stops most account takeovers, because a stolen password alone is no longer enough. **Passkeys** replace passwords with a key pair kept on the user's device; the server stores only the public key, so there is no password to steal or reuse.

## Storing passwords

Never store passwords. Store a **slow, salted hash** of each one:

- A **hash** is a one-way function: easy to compute from the password, practically impossible to reverse.
- A **salt** is a random value stored with each hash, so two users with the same password get different hashes.
- **Slow** means an algorithm made for passwords, such as Argon2, bcrypt or scrypt, that takes deliberate effort per guess. A fast hash such as SHA-256 lets an attacker who steals the database try billions of guesses per second.

> **Pitfall.** Do not write this yourself. Use your framework's or a well-known library's password functions, or an identity provider.

## Sessions and tokens

After sign-in, the user should not send the password with every request. The server gives them something to show instead:

- A **session**: a random id in a cookie. The server keeps a record that this id belongs to this user. Easy to end: delete the record.
- A **token**, often a **JWT** (JSON Web Token): a signed document that says "this is user 42, valid until 10:30". The server checks the signature and needs no lookup. Hard to cancel before it expires, so keep its life short.

**OAuth 2.0** and **OpenID Connect** are standards for "sign in with" another provider, and for giving an app limited access to another service without sharing a password.

## Authorisation: may you do this?

Knowing who someone is says nothing about what they may do. Every request that reads or changes data must check:

- Is this user allowed this **action**? Often by **role**: customer, support agent, admin.
- Is this user allowed this **object**? A customer may read *their* orders, not every order.

The second check is the one people forget. An API at `/orders/8841` that checks "is signed in" but not "is this your order" lets any user read any order by changing the number. This is **broken access control**, top of the OWASP Top 10.

## Rules

- Check authorisation **on the server**, on every request. Hiding a button in the app is not a check.
- **Deny by default.** A new endpoint should refuse until someone grants access.
- Give each user, service and key the **least privilege** it needs.

## Remember

- Authentication proves who you are. Authorisation decides what you may do.
- MFA and passkeys stop most account takeovers.
- Store passwords only as slow, salted hashes, with a well-known library.
- Sessions are easy to end; tokens are checked without a lookup and should expire soon.
- Check every request, on the server, for both the action and the object.

::quiz
? A signed-in user changes `/invoices/100` to `/invoices/101` and sees another customer's invoice. What is missing?
- Authentication
+ An authorisation check that the invoice belongs to this user
- HTTPS
! The server knew who the user was, but did not check whether this object was theirs.
? Why use bcrypt or Argon2 instead of SHA-256 to hash passwords?
+ They are deliberately slow, so stolen hashes are expensive to guess
- They produce shorter hashes
- SHA-256 cannot be salted
! A fast hash lets attackers try billions of guesses per second. Password hashes are designed to make each guess costly.
::end
