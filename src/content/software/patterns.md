---
minutes: 9
tech: []
refs:
  - gof: Introduction, and the Strategy, Observer, Adapter, Facade and Factory Method patterns
  - aposd: Ch. 19, “Software Trends”, on design patterns
---
Some design problems come up again and again: choose one of several ways to do a task, let parts react to an event without knowing each other, fit a library to the shape your code expects. Over the years, people gave names to the common solutions. These **design patterns** are a shared vocabulary: say "use an adapter here" and a colleague knows the shape at once.

## A few worth knowing

**Strategy.** Several interchangeable ways to do one job, chosen at run time. Shipping cost by courier, by post, or collection in store: each is a strategy with the same interface, `cost(order)`. The checkout code calls whichever strategy applies, with no long `if` chain. In languages with first-class functions, a strategy is often just a function passed in, as in [Functional ideas](/lesson/functional).

**Observer** (publish and subscribe). One part announces that something happened; any number of others react. When an order is paid, billing, email and analytics each listen. The order module does not know they exist. This lowers [coupling](/lesson/coupling), at the cost that the flow is harder to follow.

**Adapter.** Wrap a class whose interface does not fit, so it looks like the one your code expects. Your code calls `payments.charge(card, amount)`; an adapter turns that into the provider's own calls. Change providers and you write a new adapter, not new checkout code.

**Facade.** One simple interface in front of a complicated set of parts. A `send_invoice(order)` facade may create the PDF, store it, and email it. Callers see one call.

**Factory.** A function or class that creates objects, so callers do not need to know which concrete class to build or how. `create_storage(config)` returns local storage in tests and cloud storage in production.

**Repository.** An object that looks like a collection of domain objects, `orders.get(id)`, `orders.add(order)`, and hides the database queries behind it. Business code stays free of SQL, and tests can use an in-memory repository.

**Dependency injection.** Pass a part the objects it needs, instead of letting it create them. `Checkout(payments, email)` instead of `Checkout()` that builds its own clients. This is what makes [test doubles](/lesson/test-doubles) easy to use.

## Use with care

Patterns are answers to specific problems. Applied without the problem, they add layers and names for nothing:

- A strategy interface with one strategy.
- A factory that only ever builds one class.
- An observer where a direct call would be clearer and the coupling is fine.

> **Rule of thumb.** Write the simple version first. Reach for a pattern when you feel the problem it solves, such as a third `if` branch for the same choice, or a second provider.

## Remember

- Patterns are named solutions to recurring problems, and a shared vocabulary.
- Strategy, observer, adapter, facade, factory, repository and dependency injection cover much everyday design.
- Each pattern adds structure. Use it when its problem is really present.

::quiz
? Your code must support a second payment provider with a different API. Which pattern fits?
+ An adapter for each provider, behind one interface that your code calls
- A singleton
- An observer
! Adapters fit each provider's API to your interface, so checkout code does not change.
? A class has a factory, an interface and a strategy, and only one implementation of each. What is the likely problem?
+ Patterns added before their problems existed, making the code harder to follow
- Too few patterns
- Nothing
! Patterns earn their cost when there is real variation. Until then, simple code is better.
::end
