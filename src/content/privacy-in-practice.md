The lesson on [governance and security](/lesson/governance-security) gave the principles. This lesson is about the work. Privacy rules such as the GDPR in Europe and the CCPA in California give people rights over their data, and those rights become requirements on your pipelines.

This is an engineering overview, not legal advice. The exact duties depend on the law that applies and on your company’s legal team. Your part is to make the platform able to meet them.

## What counts as personal data

**Personal data** is any information about an identifiable person. It is wider than names.

| Kind | Examples |
|---|---|
| Direct identifiers | Name, email, phone, national ID, account number |
| Indirect identifiers | IP address, device ID, cookie ID, precise location |
| Combinations | Date of birth + postal code + gender identifies most people |
| Special categories | Health, religion, biometric data. Stricter rules |

A table with no name column can still be personal data, if a key in it leads to a person.

## The requirements, as an engineer sees them

| Right or principle | What the platform must be able to do |
|---|---|
| **Access** | Find and export everything you hold about one person |
| **Erasure** | Delete it, everywhere, within a time limit (often one month) |
| **Rectification** | Correct it, and have the correction reach derived tables |
| **Purpose limitation** | Use data only for the purpose it was collected for |
| **Minimisation** | Do not collect or keep what you do not need |
| **Storage limitation** | Delete data when its retention period ends |
| **Security** | Protect it, and know who read it |

## The hard one: deletion

A person asks to be deleted. Their data is in:

- the source database,
- raw files in the lake, in every daily partition for three years,
- silver and gold tables, and the aggregates built from them,
- old [snapshots](/lesson/table-maintenance) of each table,
- the [Kafka log](/lesson/message-brokers),
- exports, extracts, a data scientist’s notebook, a file sent to a partner,
- backups.

If the platform was not designed for it, this is weeks of work for each request. There are four designs that make it routine.

### 1. Know where personal data is

You cannot delete what you cannot find. Tag the columns that hold personal data in the [catalogue](/lesson/observability-lineage), and use [lineage](/lesson/observability-lineage) to follow each one into derived tables. Add a CI check: a new column with a name such as `email` or `phone` must have a tag.

### 2. Keep identity in one place

Do not copy the name and email into every table. Keep them in **one** customer table. Every other table has only a **surrogate key**, a number with no meaning.

To delete the person, delete or blank one row. The 400 million events with key `88231` now belong to nobody. This is **pseudonymisation**, and it makes most of the lake safe by design.

It works only if the events themselves have no identifying fields. A free-text comment or an IP address in the event breaks it.

### 3. Crypto-shredding

For data that cannot be rewritten, such as an immutable log or a backup: encrypt the personal fields of each person with a key of their own, and store the keys in a separate system. To delete the person, delete the key. The encrypted values remain and can never be read.

This is powerful and it adds real complexity: a key for each person, and a lookup on each read. Use it where a rewrite is truly not possible.

### 4. Delete jobs, on a schedule

Collect the deletion requests in a table. A regular job applies them to each table that is tagged, with a `DELETE` or a `MERGE`. Then [table maintenance](/lesson/table-maintenance) must run: a delete in a table format removes the row from the current snapshot only. The row is physically gone when the old snapshots expire and the old files are removed.

So the time to full deletion is: the interval of the delete job + the snapshot retention + the interval of the file removal. This must be less than the legal limit. Check the arithmetic.

For **backups**, the usual approach is a short retention period, so that data leaves by age, and a list of deletions that is applied again if a backup is ever restored.

For **Kafka**, use a short retention, or compacted topics where a null value for a key removes its history.

## Retention: delete by default

Each dataset has a retention period, decided with the legal team and the business: raw clickstream for 13 months, invoices for the years that tax law requires.

Implement it mechanically, not by memory:

- **Partition by date**, and drop old partitions with a scheduled job.
- **Lifecycle rules** in [object storage](/lesson/object-storage) that delete objects by age.
- **Table properties** for retention where the platform has them.

Data that you do not have cannot leak, cannot be the subject of a request, and costs nothing to store.

## Reduce what people can see

| Technique | What it does | Use |
|---|---|---|
| **Column-level security** | Hides a column from roles that do not need it | Email visible to support, not to analysts |
| **Row-level security** | Each user sees only permitted rows | A country manager sees one country |
| **Dynamic masking** | Shows `j***@example.com` by role | Analysts can count and group, but not read |
| **Hashing** | Replaces a value with a fixed code | Joins still work. Not reversible, but common values can be guessed |
| **Tokenisation** | Replaces a value with a random token. The mapping is in a vault | Card numbers. Reversible only through the vault |
| **Aggregation** | Publishes counts, not rows | Reports. Suppress small groups |
| **Generalisation** | Age band in place of date of birth. Region in place of address | Analytics that does not need precision |

**Anonymous** data is no longer personal data, and the rules do not apply to it. True anonymisation is much harder than it appears: removing the name is not enough when the remaining columns in combination identify a person. Treat “we removed the names” as pseudonymised, not anonymous.

## Privacy in the pipeline design

- **Mask early.** Remove or tokenise sensitive fields in the first step after the raw layer, as in the [flight booking design](/lesson/case-flight-booking). Gold tables then contain none.
- **Restrict the raw layer** to the pipelines and a very small number of people.
- **Development data.** Do not copy production personal data into development. Mask it, or use generated data.
- **Logs.** A pipeline that logs each record puts personal data into a log system with a different retention and different access. Log keys and counts.
- **Exports and AI services.** A file sent to a partner, or a prompt sent to an external model, is data that leaves your control. Check that the purpose is permitted and that an agreement exists.
- **Audit.** Record who queried sensitive tables. The platforms can do this. Someone must look at the record.

## Location

Some laws limit where personal data can be stored or processed. In practice: choose the [cloud region](/lesson/cloud-basics) on purpose, check where each managed service really processes data, and do not copy data between regions without a decision.

> **Pitfall.** Personal data in a free-text field. A support agent types a phone number into a comment. No tag and no mask finds it. Limit free text in analytics tables, or scan it.

> **Pitfall.** “We will add privacy later.” The surrogate key design costs little on the first day and is very expensive to add to three years of data.

> **Pitfall.** A deletion that does not reach derived tables. The customer row is gone, and the name is still in a wide export table that someone built last year.

::scenario
? You design the event tables for a new mobile application. Events will be kept for two years.
+ Put only a surrogate user key in each event, and keep name and email in one user table | A deletion is one row. The two years of events need no rewrite, and analysts can still count and group by user.
~ Put the email in each event for convenience, and plan a job that rewrites the files on each deletion request | It works, at the cost of a rewrite of two years of files for each request, and personal data in every copy and backup.
- Keep everything, and decide when the first request arrives | The first request then becomes a project with a legal deadline.
::end

## Remember

- Personal data is wider than names. A key that leads to a person counts.
- Deletion is the hard requirement. Design for it: tags, one identity table, surrogate keys elsewhere.
- A delete is complete only after snapshot expiry and file removal. Do the arithmetic on the time.
- Implement retention with partitions and lifecycle rules.
- Mask early, restrict raw data, and keep personal data out of logs, development and exports.

::quiz
? Why does a surrogate key in the event tables make deletion simple?
+ The identifying data is in one table. When that row is removed, the events can no longer be connected to a person
- Surrogate keys are encrypted
- Events are deleted automatically
! The events hold no identifying fields, so they do not need to be rewritten. This holds only if no other field in the event identifies the person.
::end
