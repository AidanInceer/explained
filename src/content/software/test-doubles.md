---
minutes: 8
tech: []
refs:
  - seag: Ch. 13, “Test Doubles”
  - goos: Ch. 8, “Building on Third-Party Code”
---
Some parts of a system are bad to use in a test: a payment provider that charges real money, an email service that sends real emails, a clock that never shows the 29th of February, a service that takes ten seconds to answer. A **test double** stands in for such a part, the way a stunt double stands in for an actor. Used well, doubles make tests fast and focused. Used too much, they make tests that pass while the real system is broken.

## Kinds of doubles

The names are used loosely, but the ideas differ:

- A **stub** returns fixed answers: "the exchange rate is 1.17". It lets the code under test run.
- A **fake** is a working, simpler version: an in-memory store instead of a database, a payment client that records charges in a list. It behaves like the real thing for the test's purposes.
- A **mock** checks how it was called: "`send_email` was called once, with this address". The test fails if the expected call did not happen.

## An example

```python
class FakePayments:
    def __init__(self):
        self.charges = []
    def charge(self, card, amount):
        self.charges.append((card, amount))
        return "ok"

def test_checkout_charges_the_basket_total():
    payments = FakePayments()
    checkout(basket_of(590), card="tok_1", payments=payments)
    assert payments.charges == [("tok_1", 590)]
```

The checkout code receives its payment client as an argument, as [Unit tests](/lesson/unit-tests) recommended, so the test can pass a fake.

## The cost of doubles

Every double is an assumption about how the real part behaves. If the assumption is wrong, the test passes and production fails:

- A stubbed database accepts any query, including one that is invalid SQL.
- A mock of a partner's API keeps returning last year's response format.
- A test full of mocks checks that the code makes certain calls in a certain order, so it breaks on every refactor, even when the behaviour is unchanged.

> **Rule of thumb.** Prefer the real thing when it is fast and safe, such as an in-memory or container database. Then prefer fakes to mocks. Use mocks for effects you cannot observe any other way, such as "an email was sent".

## Where to put the seam

Do not mock a library's details all over your code. Wrap the outside service in a small interface that you own, such as `Payments` with one method `charge`, and use a fake of *that*. Your tests then speak your language, and when the provider changes its library, only the wrapper changes.

Then test the wrapper itself against the real service, or its sandbox, in a few [integration tests](/lesson/integration-tests). The fake covers speed; those tests cover truth.

## Remember

- A test double stands in for a slow, costly or risky part.
- Stubs return answers, fakes are simple working versions, mocks check calls.
- Each double is an assumption; wrong assumptions give green tests and red production.
- Prefer real parts, then fakes, then mocks. Wrap outside services in your own interface.

::quiz
? All unit tests pass, but the app fails because the real email service rejects the new message format. Why did no test fail?
+ The tests used a double that accepted any format
- Email cannot be tested
- The tests were too fast
! A double only checks what it was told to check. A few integration tests against the real service or sandbox catch format changes.
? Which test is most likely to break during a harmless refactor?
+ One that mocks every collaborator and asserts the exact order of calls
- One that checks the function's return value
- One that uses a fake store and checks what was stored
! Tests of exact calls describe how the code works, not what it achieves, so any internal change breaks them.
::end
