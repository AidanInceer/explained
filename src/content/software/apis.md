---
minutes: 9
tech: []
refs:
  - rfc9110: Section 9, “Methods”
  - ddia: Ch. 4, “Encoding and Evolution”, sections on REST and RPC
---
An **API** (application programming interface) is how one program asks another for something. A phone app asks a server for orders. One service asks another to charge a card. Three styles cover most of the APIs you will build and use: REST, GraphQL and RPC. They solve the same problem with different trade-offs.

## What every API needs

Whatever the style, an API is a contract:

- **What you can ask for**, and in what shape.
- **What you get back**, including errors.
- **Who may ask**, which [authentication and authorisation](/lesson/auth) handle.
- **How it changes** without breaking the programs that already use it.

The last point is the hardest. Once an API is public, other teams and apps depend on its exact shape.

## REST

**REST** treats the API as a set of **resources**, each with an address, and uses [HTTP](/lesson/http) methods on them:

```
GET    /orders/8841        read one order
GET    /orders?status=open list open orders
POST   /orders             create an order
PATCH  /orders/8841        change part of it
DELETE /orders/8841        cancel it
```

- **Simple and universal.** Any language and any tool can call it. Responses can be cached with normal HTTP caching.
- **Fixed shapes.** Each endpoint returns what the server decides. A screen that needs orders, their items and the customer may need three requests, or get much more data than it shows.

## GraphQL

**GraphQL** gives one endpoint, and the client writes a query that says exactly which fields it wants:

```graphql
query {
  order(id: 8841) {
    status
    items { name quantity }
    customer { name }
  }
}
```

- **The client gets exactly what it needs**, in one request. Good for apps with many different screens.
- **More work on the server**, and harder to cache with plain HTTP. A careless query can ask for a huge amount of data, so servers must limit query depth and cost.

## RPC

**RPC** (remote procedure call) makes a remote call look like a function call: `chargeCard(cardId, amount)`. **gRPC** is a common modern form. It sends compact binary messages over HTTP/2, with the message shapes defined in a schema file, and generates client code in many languages.

- **Fast and strongly typed.** Popular between services inside a company.
- **Less friendly to browsers and to people with `curl`.**

## Change without breaking

- **Add, do not change.** A new optional field breaks nobody. Renaming or removing a field breaks every client that reads it.
- **Be strict in what you send and tolerant in what you accept**: ignore unknown fields.
- **Version** when you must break: `/v2/orders`, or a version header. Keep the old version running until clients have moved.

> **Pitfall.** Mobile apps stay installed for years. An API change that breaks old app versions breaks real users who never chose to update.

## Errors and pages

Return clear errors with the right status code and a body that says what was wrong. Never return a list of a million items: use **pagination**, returning a page and a way to ask for the next, such as a cursor.

## Remember

- An API is a contract: requests, responses, errors, access, and how it changes.
- REST: resources and HTTP methods. Simple and cacheable.
- GraphQL: the client asks for exactly the fields it needs.
- RPC: function-like calls, fast and typed, common between services.
- Add fields instead of changing them. Version only when you must break.

::quiz
? A mobile app screen needs data from five REST endpoints and is slow on phone networks. What could help?
+ A GraphQL query, or one endpoint shaped for that screen, so it needs one round trip
- Splitting the data into more endpoints
- Removing caching
! Many requests mean many round trips. Fetching what the screen needs in one request removes most of them.
? You want to rename the field `cust` to `customer` in a public API. What is the safe way?
- Rename it and tell clients afterwards
+ Add `customer` alongside `cust`, move clients over, and remove `cust` later
- Rename it only in the documentation
! Renaming breaks every client that reads the old name. Adding first keeps old clients working.
::end
