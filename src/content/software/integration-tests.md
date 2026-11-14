---
minutes: 8
tech: []
refs:
  - seag: Ch. 14, “Larger Testing”
  - goos: Ch. 1, “What Is the Point of Test-Driven Development?”, on end-to-end testing
---
Unit tests prove that each piece works on its own. They cannot prove that the pieces work together: that the SQL is valid for the real database, that the API returns what the app expects, that a user can really sign in and pay. **Integration** and **end-to-end tests** check the connections.

## Integration tests

An **integration test** runs several real parts together, usually your code with real infrastructure:

- Your data access code against a real database, started for the test.
- Your HTTP handler, called with a real request, through the routing and validation.
- Your code calling a partner's API in its sandbox environment.

```python
def test_order_is_saved_and_read_back(db):
    repo = OrderRepository(db)
    order_id = repo.create(customer_id=7, total_pence=590)
    assert repo.get(order_id).total_pence == 590
```

Here `db` is a real, empty database created for the test, often in a container, so the test checks the real SQL and the real constraints.

## End-to-end tests

An **end-to-end test** uses the whole system as a user would: open the app or the browser, click, type, and check what appears. Tools such as Playwright and Cypress drive a real browser; Espresso and XCUITest drive phone apps.

They give the most confidence, because they test what the user experiences. They are also:

- **Slow**: seconds to minutes each.
- **Fragile**: a changed button label or a slow network can break them.
- **Hard to debug**: a failure could be anywhere in the stack.

So keep them few. Cover the paths that must never break: sign up, sign in, pay, the main task of the product.

## Contract tests

When two teams own two services, an end-to-end test of both is slow and shared. A **contract test** checks each side against an agreed description of the API instead: the client's expectations are recorded, and the server's test suite checks that it still meets them. A breaking change fails in the server's own CI, before release.

## Keep them reliable

Larger tests are where flakiness grows. To keep them trustworthy:

- **Fresh data for each test.** Do not depend on what an earlier test left behind.
- **Wait for conditions, not for time.** "Wait until the button appears" is reliable. "Sleep two seconds" is slow and still flaky.
- **Control what you can.** Fix the clock, use test accounts, and stub third-party services that you do not own, as the next lesson explains.

> **Rule of thumb.** For each bug found in production, ask which kind of test would have caught it most cheaply, and add that one.

## Remember

- Integration tests check your code with real infrastructure, such as a database.
- End-to-end tests use the whole system like a user. Keep them few and for critical paths.
- Contract tests check two services against a shared API description.
- Use fresh data and wait for conditions to keep larger tests reliable.

::quiz
? Unit tests pass, but production fails because a SQL query uses a column that does not exist. Which test would have caught it?
+ An integration test against a real database
- Another unit test with a mocked database
- A linter
! A mock accepts any query. Only a real database checks the SQL against the real schema.
? An end-to-end test sometimes fails because a page loads slowly. What is the better fix?
+ Wait until the expected element appears, with a timeout
- Add a fixed five-second pause
- Delete the test
! Waiting for the condition is both faster and more reliable than a fixed sleep.
::end
