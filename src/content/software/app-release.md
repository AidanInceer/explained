---
minutes: 8
tech: []
refs:
  - appledev: “App Store Review Guidelines”, TestFlight, and “Release a version update in phases”
  - androiddev: Google Play Console Help, “Release app updates with staged rollouts”
---
A web team can deploy ten times a day and fix a mistake in minutes. An app team cannot. Each release goes through a store's review, users install updates when they choose, and a bad version stays on phones for months. Releasing an app well is about catching problems before they reach everyone.

## Build and sign

A release build is different from the one you run while developing: optimised, without debug tools, with production settings. It must be **signed** with the developer's certificate, so the store and the phone know who made it and that nobody changed it. Losing the signing key for an Android app can mean you can never update it again, so most teams let Google Play manage the key.

Each build has a **version** that users see, such as 2.4.0, and a **build number** that must go up with every upload.

## Test with real users first

- **TestFlight** (Apple) and **internal and closed testing** tracks (Google Play) send builds to testers before the public release.
- Use them for every release, not only big ones. Testers on different phones find problems that your own devices do not.

## Store review

Both stores review apps before they are published. Apple reviews every update against its guidelines, with automated checks and people involved; most reviews finish within a day or two, but a rejection costs another round. Google Play's review is mostly automated and is usually faster. Common rejections: crashes, broken links, missing account deletion, unclear data use, and payments that bypass the store's rules.

So you cannot ship an urgent fix in minutes. Plan for that.

## Staged rollouts

Release to a small share of users first:

- Google Play lets you choose a percentage, such as 1%, then 10%, then everyone, and halt at any point.
- The App Store's **phased release** spreads an update over seven days for users with automatic updates on, and you can pause it.

Watch crash rates and key measures at each step. If something is wrong, stop the rollout before most users have the update.

## Old versions live for a long time

Many users do not update for months. So:

- The server API must keep working for old app versions, as in [APIs: REST, GraphQL and RPC](/lesson/apis).
- Use **remote configuration** and feature flags to turn features off without a new release.
- For real emergencies, such as a security hole, keep a way to tell old versions that they must update.

> **Rule of thumb.** Assume that every version you ship will still be in use in a year, and design the server for it.

## Remember

- Release builds are optimised and signed. Guard the signing key.
- Test every release with real users through TestFlight or testing tracks.
- Store review takes time. Fixes are not instant.
- Use staged rollouts, watch crashes, and keep the server working for old versions.

::quiz
? A new version has a crash that affects 5% of users. Why does a staged rollout help?
+ You can halt it while only a small share of users have the update
- It removes the crash automatically
- It makes the store review faster
! Staged rollouts limit how many users get a bad version before you notice and stop it.
? Why must an app's server API stay compatible with old versions?
+ Many users keep old app versions for months
- Stores require one API version per app
- Old versions update themselves every day
! Users choose when to update. Breaking the API breaks their app.
::end
