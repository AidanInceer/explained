---
minutes: 8
tech: []
refs:
  - owasp: A06, “Vulnerable and Outdated Components”, and A08, “Software and Data Integrity Failures”
  - seag: Ch. 21, “Dependency Management”
---
Most of the code your application runs, you did not write. It comes from packages, and their packages, as [Packages and dependencies](/lesson/packages) showed. Each of them is trusted with the same power as your own code. When one of them has a hole, or is changed by an attacker, you are affected too. This is the **software supply chain**.

## How it goes wrong

- **Known vulnerabilities.** A popular library has a security bug. It is published and fixed, but you still run the old version. In 2021 the Log4Shell bug in Log4j, a Java logging library used almost everywhere, let attackers run code on servers by sending a crafted text string.
- **Malicious packages.** An attacker publishes a package with a name close to a popular one, hoping for a typo (**typosquatting**), or takes over a maintainer's account and adds harmful code to a real package.
- **Compromised builds.** The attacker changes the build system, not the code, so the released package differs from the source that people reviewed.
- **Abandoned packages.** The only maintainer stops, and nobody fixes new problems.

## Defences

**Know what you run.**

- Keep a lock file, so you know the exact version of every package, as you should anyway.
- Tools can produce a **software bill of materials** (SBOM): a list of every component in a build.

**Find known problems.**

- Turn on dependency scanning, such as GitHub's Dependabot, `npm audit`, `pip-audit`, or similar tools. They compare your versions with databases of known vulnerabilities and propose upgrades.
- Update dependencies regularly, in small steps. A project that updates every week has small, easy upgrades. One that waits two years faces a huge, risky jump in an emergency.

**Be careful what you add.**

- Fewer dependencies mean fewer risks. A few lines of your own code may be better than a package.
- Check the exact name, the maintainers, the download count and the activity before you add something.
- Be wary of packages that run install scripts.

**Trust the build.**

- Install from lock files in CI (`npm ci`, not `npm install`).
- Pin CI actions and container images to exact versions or digests.
- Prefer packages with **provenance**: a signed statement of where and how they were built.

> **Rule of thumb.** Treat a dependency update like any other change: review the release notes, run the tests, ship it through the normal pipeline. Automate the routine ones so they are not left to pile up.

## Remember

- Every dependency is trusted code. Its problems are your problems.
- Risks: known bugs in old versions, malicious packages, compromised builds, abandonment.
- Know what you run, scan it, and update often in small steps.
- Add few dependencies, check them first, and build from lock files.

::quiz
? A widely used library announces a serious vulnerability. A team that updates monthly and one that has not updated in two years both need the fix. Who has the easier time?
+ The team that updates monthly: their upgrade is a small step
- The team that waited: fewer changes to review
- Both the same
! Regular small updates keep emergency upgrades small and low-risk.
? A developer adds `reqeusts` (misspelled) to a Python project. What is the risk?
+ It may be a typosquatted malicious package that runs harmful code
- None: pip corrects spelling
- It will be slower
! Attackers register names close to popular packages. Check exact names before installing.
::end
