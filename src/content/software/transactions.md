---
minutes: 9
tech: []
refs:
  - ddia: Ch. 7, “Transactions”
---
Many users change the same database at the same time. Two people buy the last ticket. Two clerks edit one customer. A transfer moves money between accounts while a report adds up the totals. **Transactions** are how a database keeps all of this correct, and **isolation levels** decide how much protection you get.

## A transaction

A **transaction** groups several reads and writes into one unit:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Either both changes happen, or neither does. If the server crashes between the two lines, the database undoes the first one when it restarts. This is the A, **atomicity**, of ACID. The other letters are consistency, isolation and durability: rules hold, concurrent transactions do not see each other's half-done work, and committed data survives a crash.

## The lost update

Isolation is where the subtle bugs are. A classic one:

1. Clerk A reads stock: 10.
2. Clerk B reads stock: 10.
3. A sells 1 and writes 9.
4. B sells 1 and writes 9.

Two were sold. The stock says one. This is a **lost update**, the same race as in [Concurrency](/lesson/concurrency), now in a database.

Fixes:

- **Let the database do the arithmetic**: `UPDATE stock SET count = count - 1 WHERE id = 7`. The database applies each change to the latest value.
- **Lock the row** while you work: `SELECT ... FOR UPDATE`. Others wait until you commit.
- **Check before you write**: `UPDATE ... SET count = 9, version = 6 WHERE id = 7 AND version = 5`. If someone else changed it, no row matches, and you try again. This is **optimistic locking**.

## Isolation levels

Full isolation, where transactions behave as if they ran one after another, is called **serializable**. It is correct and slower, because the database must prevent or detect every conflict. So databases offer weaker levels:

| Level | Prevents | Still allows |
|---|---|---|
| Read committed | Reading others' uncommitted changes | Lost updates, a value changing between two reads |
| Snapshot (repeatable read) | Values changing between reads in one transaction | Some write conflicts, such as **write skew** |
| Serializable | All of these | Nothing; some transactions are aborted and must retry |

PostgreSQL's default is read committed. Many developers assume they have more protection than they do.

> **Pitfall.** Write skew: two doctors are on call, and the rule is "at least one must be on call". Both check "is someone else on call?", both see yes, and both go off call. Each transaction was fine alone. Only serializable isolation, or an explicit lock, prevents it.

## In practice

- Keep transactions short. A transaction that waits for a user or a network call holds locks and blocks others.
- Put the rules in the database where you can: constraints, unique keys, `CHECK`.
- When the right answer matters, money or stock, use row locks, conditional updates, or serializable isolation, and retry on conflict.

## Remember

- A transaction applies all its changes or none.
- Concurrent transactions can lose updates. Let the database compute, lock, or check a version.
- Isolation levels trade safety for speed. Know which one you use.
- Keep transactions short, and use stronger isolation for critical data.

::quiz
? Two requests each read a stock count of 5, subtract 1 in application code, and write 4. What happened?
+ A lost update: one sale is not counted
- A deadlock
- Nothing wrong
! Both read the same old value. `count = count - 1` in SQL, a lock, or a version check prevents it.
? A transfer debits one account, then the server crashes before the credit. With a transaction, what does the database do?
- Keeps the debit and loses the credit
+ Rolls back the debit when it recovers, because the transaction never committed
- Applies the credit twice
! Atomicity: a transaction that did not commit leaves no changes behind.
::end
