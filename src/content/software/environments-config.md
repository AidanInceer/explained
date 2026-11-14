---
minutes: 7
tech: []
refs:
  - twelve: III, “Config”, and X, “Dev/prod parity”
---
The same code runs on your laptop, in tests, in a staging copy of the system, and in production. Each place needs different settings: a different database, different keys, debug output on or off. **Configuration** is everything that differs between these places. Keeping it apart from the code, and the places as similar as possible, prevents a whole class of "it worked in testing" failures.

## Environments

Most teams have at least:

- **Local**: each developer's machine, with test data.
- **CI**: where the automated tests run.
- **Staging** (or pre-production): a copy of production, with fake or masked data, to check a release before real users see it.
- **Production**: the real system, with real users and real data.

## Config is not code

The rule from the Twelve-Factor App: **the same build** goes to every environment. Only the configuration changes. Never build a special version for production.

So configuration must come from outside the build:

- **Environment variables**: `DATABASE_URL`, `LOG_LEVEL`, `PAYMENTS_API_KEY`. Supported by every language and platform.
- **Config files** mounted at run time, for larger structured settings.
- A **config service** or secrets manager, which the program reads at start-up.

```python
import os
DATABASE_URL = os.environ["DATABASE_URL"]          # required: fail at start if missing
LOG_LEVEL = os.environ.get("LOG_LEVEL", "info")    # optional, with a default
```

Read all configuration at start-up, check it, and fail at once with a clear message if something required is missing. A service that starts and crashes an hour later on the first payment is much harder to debug.

## Secrets are config, handled with more care

Database passwords and API keys are configuration too, but they must never be in the repository, as [Secrets and keys](/lesson/secrets) explained. Commit a `.env.example` file that lists the names, with no values, so a new developer knows what to set.

## Keep environments alike

Each difference between staging and production is a place where a bug can hide:

- Use the **same kind of database**, at the same version, everywhere. SQLite on a laptop and PostgreSQL in production behave differently.
- Use the same operating system and runtime versions, which [containers](/lesson/containers) make easy.
- Deploy to staging in the same way as to production.

> **Pitfall.** A feature that depends on `if environment == "production"` behaves one way in production and another everywhere you tested it. Prefer a specific setting, such as `SEND_REAL_EMAILS=true`, that tests can turn on.

## Remember

- Environments: local, CI, staging, production.
- One build for all of them. Only the configuration differs.
- Take config from environment variables or mounted files; check it at start-up.
- Keep secrets out of the repository, and keep environments as alike as you can.

::quiz
? A team builds a separate artefact for production with different settings compiled in. What is the risk?
+ The production build was never tested, so its bugs appear only in production
- Builds take longer
- Nothing
! Test the exact artefact that you deploy. Settings belong in configuration, outside the build.
? A service starts fine but fails an hour later because an API key variable is missing. What would be better?
+ Read and check all required configuration at start-up, and refuse to start if any is missing
- Use a default key
- Log a warning and continue
! Failing at start-up shows the problem during the deploy, not later in front of users.
::end
