---
minutes: 8
tech: []
refs:
  - seag: Ch. 12, “Unit Testing”
---
A **unit test** checks one small piece of code, a function or a class, on its own. Unit tests run in milliseconds, so you can have thousands and run them all on every change. They are the base of the test pyramid from [Why test](/lesson/why-test).

## What to test

Test the **behaviour** that callers rely on, through the public interface:

```python
def test_basket_total_includes_quantities():
    basket = Basket()
    basket.add("tea", price=250, quantity=2)
    basket.add("milk", price=90)
    assert basket.total() == 590
```

This test does not look at how the basket stores items. If you change the inside, the test still passes as long as the behaviour is right. That is the point.

## Choose the cases

For each behaviour, think about:

- **The normal case**: two items, as above.
- **Edges**: an empty basket, one item, a quantity of zero, the largest allowed value.
- **Errors**: a negative quantity should raise an error. Test that it does.

```python
import pytest

def test_negative_quantity_is_refused():
    with pytest.raises(ValueError):
        Basket().add("tea", price=250, quantity=-1)
```

Most bugs hide at the edges: empty lists, the first and last item, zero, midnight, the end of the month.

## One behaviour per test

Each test should check one thing and have a name that says what:

- `test_total_of_empty_basket_is_zero`
- `test_discount_applies_only_above_20_pounds`

When one of these fails, the name tells you what broke before you read any code. A test called `test_basket_2` that checks ten things tells you nothing.

## Keep them independent

Each test sets up its own data and does not depend on another test running first. Tests that share state pass alone and fail together, or the other way round, which is a common source of flaky tests.

## Make code easy to test

Some code is hard to unit test: it reads the clock, calls the network, or writes to a database deep inside. The fix is usually in the design, not the test:

- Pass dependencies in, instead of creating them inside: give the function the current time as an argument, or a "clock" object.
- Keep logic in [pure functions](/lesson/functional) and put the effects at the edges.

```python
def is_overdue(invoice, today):   # easy to test: pass any date
    return today > invoice.due_date
```

> **Rule of thumb.** If a unit test needs a lot of set-up, the code under test probably does too much. Listen to the test.

## Remember

- Unit tests check one piece of behaviour, through its public interface, in milliseconds.
- Test the normal case, the edges and the errors.
- One behaviour per test, with a name that says what it checks.
- Keep tests independent. Design code so its logic is easy to call in a test.

::quiz
? A test checks that `Basket` stores items in a list named `_items`. The team changes it to a dictionary, and the test fails although totals are still correct. What is wrong with the test?
+ It tests how the code works inside, not the behaviour callers rely on
- Nothing: tests should check internals
- It should test the dictionary too
! Tests of internals break on every refactor. Test the public behaviour instead.
? A function uses `datetime.now()` inside, which makes it hard to test. What is the usual fix?
+ Pass the current time in as an argument
- Run the test at a fixed time of day
- Do not test it
! Passing the time in lets each test choose any date, including the tricky edges.
::end
