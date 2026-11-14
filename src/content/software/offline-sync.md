---
minutes: 9
tech: []
refs:
  - localfirst: “Seven ideals for local-first software”, and “CRDTs as a foundational technology”
  - ddia: Ch. 5, “Replication”, section on multi-leader replication and handling write conflicts
---
Phones lose their network in lifts, trains, basements and planes. An app that shows a spinner whenever the network drops feels broken. An **offline-first** app reads and writes data on the device first, and syncs with the server when it can. It is fast all the time and works anywhere. The hard part is what happens when two copies of the data change separately.

## Local first

The app keeps its own copy of the user's data in a **local database**, usually SQLite or a library built on it.

- **Reads** come from the local copy: instant, with or without a network.
- **Writes** go to the local copy at once, and the screen updates at once.
- A **sync** process sends local changes to the server and fetches changes from it, in the background.

This is also called an **optimistic** interface: the app shows the change as done before the server confirms it, and corrects it if the server later refuses.

## The outbox

Changes made offline wait in an **outbox**: a list of operations still to send. When the network returns, the app sends them in order. Each operation needs:

- A unique id, so the server can ignore a duplicate if a send is retried, as in [Queues and background jobs](/lesson/queues).
- Enough information for the server to apply it to the current data, not just "set the whole record to this".

## Conflicts

The user edits a note on their phone, offline. Meanwhile they edit the same note on their laptop. Both changes reach the server. Which wins?

- **Last write wins**: keep the change with the latest timestamp. Simple, and it silently throws one edit away. As [Distributed systems basics](/lesson/distributed) explained, device clocks also disagree.
- **Merge by field**: if one device changed the title and the other the body, keep both. Only a real clash on the same field needs a rule.
- **Ask the user**: show both versions, as a code merge does. Right for important documents; annoying for small things.
- **CRDTs** (conflict-free replicated data types): data structures designed so that any two copies can always be merged to the same result, in any order. Collaborative editors use them for text and lists.

> **Rule of thumb.** Choose the conflict rule for each kind of data, by asking what the user would expect. A shopping list can merge items. A bank transfer must never be "merged".

## Things to decide

- **What is stored on the device?** All of the user's data, or only recent items? Phones have limited space.
- **What happens on sign-out?** Delete local data, so the next user of the device cannot see it.
- **What does the user see?** Show clearly when they are offline, and which changes are not synced yet.
- **What the server must still check.** The server is the final judge of rules such as stock limits and permissions. A change that was fine offline may be refused.

## Remember

- Offline first: read and write locally, sync in the background.
- Queue changes in an outbox, each with a unique id.
- Choose a conflict rule for each kind of data. Last write wins loses edits.
- Show sync status, and let the server enforce the rules.

::quiz
? A user adds an item to a list offline, and the app shows it at once. What makes this safe?
+ The change is stored locally and queued in an outbox to sync later
- The app waits for the network before showing it
- The server is not needed
! Local-first apps write locally and sync later. The outbox makes sure the change reaches the server.
? Two devices edit different fields of the same record while offline. What is the best way to resolve it?
+ Merge them: keep each device's change to its own field
- Keep the device with the later clock
- Delete the record
! Changes to different fields do not clash. Merging keeps both; last write wins would lose one.
::end
