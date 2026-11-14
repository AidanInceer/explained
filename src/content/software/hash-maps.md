---
minutes: 8
tech: []
refs:
  - clrs: Ch. 11, “Hash Tables”
  - ddia: Ch. 3, “Hash Indexes”
---
A **hash map** finds a value by its key in about the same time whether it holds ten items or ten million. It is the most used data structure after the array: Python's `dict` and `set`, JavaScript's `Map` and objects, Java's `HashMap`. Caches, database indexes and compilers all depend on it.

## The problem

You have a million customers and want the one with id `C-48213`. In a list you look at each one: O(*n*). If the list is sorted, binary search takes about 20 steps: O(log *n*). A hash map takes about one step: O(1) on average.

## The idea

A hash map is an array of **buckets**. To store a pair of a key and a value:

1. Run the key through a **hash function**. It turns any key into a number, the **hash**, and the same key always gives the same number.
2. Use the hash to pick a bucket, for example the hash divided by the number of buckets, keeping the remainder.
3. Put the pair in that bucket.

To find a key later, hash it again, go straight to the same bucket, and look there. You skip every other bucket.

A good hash function spreads keys evenly, so each bucket holds very few pairs.

## Collisions

Two different keys can land in the same bucket. This is a **collision**, and it is normal. The usual answer is to keep a short list in each bucket and check each pair in it. As long as the lists stay short, lookups stay fast.

To keep them short, the map grows. When it holds too many pairs for its number of buckets, it makes a bigger array, often twice as large, and moves every pair to its new bucket. That move is slow, but it is rare, so the average cost of an insert stays constant.

## What a hash map cannot do

- **No order.** Keys are spread by their hash, not sorted. You cannot ask for "all ids between C-1000 and C-2000" without looking at every key. A tree or a sorted list does that.
- **Keys must not change.** If you change a key after you store it, its hash changes, and the map looks in the wrong bucket. This is why Python does not allow a list as a dictionary key, but allows a tuple.
- **Memory.** Spare buckets cost space.

> **For experienced readers.** An attacker who knows the hash function can send keys that all collide, and turn every lookup into a slow list search. Many languages now use a random hash key for each run of the program to prevent this.

## Sets

A **set** is a hash map with keys and no values. It answers "is this in it?" in constant time. When code asks `if x in big_list` inside a loop, change `big_list` to a set and the loop can become thousands of times faster.

## Where you see them

- Counting: how many times each word appears in a text.
- Joining: matching orders to customers by id, as in [Cost of an algorithm](/lesson/big-o).
- Caching: keep results by their input, so you compute each one once.
- Removing duplicates: put items in a set.

## Remember

- A hash map turns a key into a bucket number, so a lookup goes straight to the right place.
- Lookups and inserts take constant time on average. Collisions are normal and handled.
- A hash map has no order, and its keys must not change.
- A set is a hash map with only keys: fast membership tests.

::quiz
? Why can a hash map find a key without looking at the other keys?
+ It computes the bucket from the key's hash and looks only in that bucket
- It keeps the keys sorted
- It checks the keys in parallel
! The hash of the key gives the bucket directly, so the other buckets are never visited.
? You need all orders with a date between 1 and 31 March. Is a hash map keyed by date the right structure?
- Yes, hash maps are fast for every query
+ No, a hash map has no order, so a range query must check every key
- Yes, if the dates are strings
! Hash maps answer exact-key questions. Range queries need sorted data, such as a tree or a sorted list.
::end
