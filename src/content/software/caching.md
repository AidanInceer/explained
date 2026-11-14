---
minutes: 8
tech: []
refs:
  - ddia: Ch. 5, “Replication”, on stale reads, and Ch. 11, on keeping derived data in step
  - rfc9110: Section 8.8, “Validator Fields”
---
A **cache** keeps a copy of data close to where it is used, so the next request does not have to fetch or compute it again. Caches are everywhere: in the CPU, the browser, the CDN, the server's memory, in front of the database. They are the most common way to make a system fast. They also bring the hardest question in the subject: when is the copy wrong?

## Where caches sit

- **Browser cache**: files and responses kept by the user's browser, as [HTTP](/lesson/http) explained.
- **CDN**: copies of static files and pages in data centres near users.
- **Application cache**: results kept in the server's memory, or in a shared store such as Redis, so every server can use them.
- **Database cache**: the database keeps often-read pages of data in memory.

Each one saves a trip to a slower place, the same idea as the CPU caches in [How computers work](/lesson/how-computers-work).

## Cache-aside

The most common pattern in application code:

1. Look for the value in the cache.
2. If it is there (a **hit**), use it.
3. If not (a **miss**), read it from the database, store it in the cache, and use it.

```python
def product(id):
    p = cache.get(f"product:{id}")
    if p is None:
        p = db.load_product(id)
        cache.set(f"product:{id}", p, ttl=300)
    return p
```

## When the copy is wrong

The price changes in the database. The cache still holds the old price. Now the site shows one price and charges another. This is a **stale** cache, and there are three main answers:

- **Expire it.** Give every entry a **time to live** (TTL), here 300 seconds. Simple, and the data can be up to five minutes old. Fine for a product description; not for a bank balance.
- **Delete on change.** When code changes a product, it also deletes that product's cache entry. The next read loads the new value. Precise, but every place that changes the data must remember.
- **Do not cache it.** Some data must always be exact. Read it fresh.

> **Pitfall.** Cache only what you can afford to see a little out of date. Decide, for each kind of data, how old is acceptable, and choose the TTL from that.

::fig sw-cache | A minute of reads, one a second. The data changes three times.

## Other traps

- **Stampede.** A popular entry expires, and a thousand requests all miss at once and hit the database together. Let one request refresh it while others wait, or refresh before it expires.
- **Wrong key.** A cache keyed only by product id serves one user's personalised price to everyone. Include everything that changes the answer in the key.
- **Memory.** A cache with no limit grows until the server runs out of memory. Set a maximum size and evict the least recently used entries.
- **Hiding problems.** A cache can hide a slow query until the day the cache is empty, for example after a restart. Then everything is slow at once.

## Remember

- A cache keeps a copy close to where it is used.
- Cache-aside: look in the cache, and on a miss load and store.
- Choose for each kind of data how stale it may be. Expire, delete on change, or do not cache.
- Watch for stampedes, wrong keys and unlimited growth.

::quiz
? A product's price is cached for one hour. An admin changes the price. What do users see?
+ The old price, for up to an hour, unless the change also deletes the cache entry
- The new price at once
- An error
! A TTL-based cache serves the old copy until it expires. Delete the entry on change to see the new value at once.
? A cache key is only the page path, but each user sees their own name on the page. What goes wrong?
+ One user's page, with their name, can be shown to other users
- The cache never hits
- The page loads more slowly
! The key must include everything that changes the result. Personal pages must not share a cache key.
::end
