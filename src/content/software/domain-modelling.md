---
minutes: 8
tech: []
refs:
  - ddd: Part I, “Putting the Domain Model to Work”, and Ch. 14, “Maintaining Model Integrity”
---
Software exists to serve some part of the world: insurance, shipping, a hospital, a game. That part of the world is the **domain**. When the code uses the same words and rules as the people who work in the domain, they can read it, check it and change it together. When it does not, every conversation needs translating, and translations lose meaning.

## A shared language

Domain-driven design calls it the **ubiquitous language**: one set of words, agreed with the domain experts, used in conversation, documents and code.

If the business says "a policy is renewed", the code has `policy.renew()`, not `update_record(type=2, flag=True)`. If the business distinguishes a "quote" from a "policy", the code has two types, not one table with a status column that means both.

When you find that two people mean different things by one word, you have found a real design question. Resolve it, and put the answer in the code.

## Model the rules, not only the data

A weak model is just data with getters and setters, and the rules live scattered in other code:

```python
order.status = "shipped"   # anyone can do this, at any time
```

A stronger model keeps the rules with the data:

```python
order.ship(tracking_number)   # refuses if the order is not paid
```

Now "only paid orders can ship" is enforced in one place, and the code reads like the business rule.

## Value objects and entities

- An **entity** has an identity that lasts while its details change: customer 42 is the same customer after moving house.
- A **value object** is defined only by its values: £5.00 is £5.00, whichever note you hold. Value objects are usually [immutable](/lesson/functional).

Making `Money`, `EmailAddress` or `DateRange` value objects, instead of bare numbers and strings, puts their rules in one place: money cannot be added across currencies, an email must be valid when it is created.

## Bounded contexts

In a large business, one word means different things in different departments. To sales, a "customer" is a lead with contact history. To billing, it is an account with payment terms. Forcing one `Customer` class to serve both gives a huge, confused model.

A **bounded context** is a part of the system with its own model and its own meanings. Sales and billing each have their own `Customer`, and they exchange only what they need, often with an id. These boundaries are also good candidates for module or service boundaries, as the lesson [Monolith or services](/lesson/architecture-styles) discusses.

## When to bother

Rich domain models pay off where the rules are complex and change often: finance, logistics, healthcare. For a simple form that stores and shows data, plain data structures are fine. Match the effort to the complexity of the domain.

## Remember

- Use the domain experts' words in the code, and resolve words that mean two things.
- Keep business rules with the data they protect.
- Entities have identity; value objects are defined by their values.
- Bounded contexts give each part of the business its own model.

::quiz
? The code has `Customer` with 80 fields used by sales, billing and support. What concept helps?
+ Bounded contexts: each department gets its own smaller customer model
- A bigger customer table
- More getters and setters
! Different parts of the business mean different things by "customer". Separate models stay small and clear.
? Why make `Money` a value object instead of using a plain number?
+ Its rules, such as currency and rounding, live in one place and cannot be bypassed
- Numbers are slower
- Value objects use less memory
! A plain number lets any code add pounds to euros. A value object refuses.
::end
