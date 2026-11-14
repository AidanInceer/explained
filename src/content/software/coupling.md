---
minutes: 8
tech: []
refs:
  - pragprog: Topic 8, “The Essence of Good Design”, and Topic 28, “Decoupling”
  - aposd: Ch. 5, “Information Hiding (and Leakage)”
---
You fix a bug in the invoices module, and the email reports break. You add a field to the customer, and fifteen files must change. These are signs of **coupling**: parts of the system that depend on each other's details. Its partner idea is **cohesion**: whether the things inside one part belong together. Good design has low coupling and high cohesion, so each change stays in one place.

## Coupling

Two modules are **coupled** when a change in one forces a change in the other. Some coupling is necessary: an order module must call the payment module somehow. The question is how much each needs to know about the other.

Kinds of coupling, from loose to tight:

- **Through a small interface**: the order module calls `payments.charge(card, amount)` and knows nothing more.
- **Through shared data**: both read and write the same table, so a column change affects both.
- **Through internal details**: one reaches into the other's private fields, or depends on the order in which it does things.

The tighter the coupling, the more a change spreads.

## Cohesion

A module has high **cohesion** when its parts serve one purpose and change for the same reasons. A `billing` module with invoices, tax and payment terms is cohesive. A `utils` module with date formatting, a retry helper and a tax rate is not: its parts change for unrelated reasons, and everyone depends on it.

> **Rule of thumb.** Put together the things that change together. If a typical feature touches code in five folders, the folders are cut along the wrong lines.

## Ways to reduce coupling

- **Depend on interfaces, not details.** Call a small, stable interface, as in [Modules and interfaces](/lesson/modules-interfaces).
- **Tell, do not ask.** Instead of reading an object's data and deciding for it (`if order.status == "paid" and order.items...`), ask it to do the job (`order.ship()`). The rule stays with the data.
- **Avoid chains.** `customer.account.address.postcode` couples the caller to three objects' structure. Give the caller what it needs directly.
- **Events.** When the invoice module must react to an order being paid, the order module can publish "order paid", and any module may listen. Neither needs to know the other.
- **Do not share databases between services.** Each service owns its data; others ask through its API.

## Do not overdo it

Every layer of indirection, every interface and every event adds something to read and follow. Decoupling two parts that always change together only spreads one change over more files. Cut along the lines where changes really are independent.

## Remember

- Coupling: a change in one module forces changes in another. Keep it low.
- Cohesion: a module's parts belong together. Keep it high.
- Put together things that change together. Depend on small interfaces.
- Decouple where changes are independent; do not add layers for nothing.

::quiz
? Every new report requires changes in the reporting, billing and customer modules. What does this suggest?
+ The modules are coupled, and report logic is spread across them
- The modules are well designed
- Reports should not exist
! A change that always touches several modules shows that their boundaries do not follow the way the system changes.
? A `helpers.py` file has 60 unrelated functions, and most of the code imports it. What is the issue?
+ Low cohesion: unrelated parts are grouped, and everything depends on them
- High cohesion
- Too few functions
! Group code by purpose. A grab-bag module couples everything to everything.
::end
