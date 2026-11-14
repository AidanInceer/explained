---
minutes: 9
tech: []
refs:
  - clrs: Ch. 2, “Getting Started”, Ch. 7, “Quicksort”, and Ch. 8, “Sorting in Linear Time”
---
Sorting is one of the most studied problems in computing, because sorted data is so much easier to work with. You will rarely write a sort yourself. You will often choose to sort, or choose to keep data sorted, and you need to know what that costs and what it buys.

## Searching unsorted data

To find a value in an unsorted list, you look at each item until you find it, or reach the end. This is **linear search**: O(*n*). For a few hundred items it is fine. For a million items searched many times, it is not.

## Binary search

If the list is sorted, you can do far better. Look at the middle item:

- If it is the value, you are done.
- If the value is smaller, it must be in the left half. Throw away the right half.
- If the value is larger, throw away the left half.

Repeat on the half that remains. Each step halves the list, so a million items need about 20 steps, and a billion about 30. This is **binary search**: O(log *n*).

It is the same method that you use to find a word in a printed dictionary. You never start at page one.

> **Pitfall.** Binary search on data that is not sorted gives wrong answers with no error. Make sure the data is sorted, by the same rule that the search uses.

## How fast can you sort?

Simple sorts, such as **insertion sort**, which takes each item and slides it into place among the sorted ones, take O(*n*²) time. They are fine for small lists and for lists that are almost sorted already.

Good general sorts take O(*n* log *n*). Two classic ones:

- **Merge sort** splits the list in half, sorts each half, then merges the two sorted halves by repeatedly taking the smaller front item. It always takes O(*n* log *n*) and keeps equal items in their original order.
- **Quicksort** picks a **pivot** item, moves smaller items to its left and larger ones to its right, then sorts each side. It is very fast in practice, with a rare worst case of O(*n*²) that good pivot choices make unlikely.

Sorts that compare pairs of items cannot do better than O(*n* log *n*) in general. That is a proven limit.

## What your language does

Python's sort, and Java's sort for objects, are based on **Timsort**: a mix of merge sort and insertion sort that is very fast on real data, which often contains runs that are already in order. Other languages use similar hybrids. Use the built-in sort. It is faster and better tested than anything you will write.

## Stable sorts

A sort is **stable** if items that compare equal keep their original order. This matters when you sort by one thing, then another. Sort a list of people by name, then stably by city, and within each city the names stay in alphabetical order.

## Sort once, search many times

Sorting costs O(*n* log *n*). Each binary search then costs O(log *n*). If you search many times, sort once and search fast. If you search once, a linear search is cheaper than a sort. And if you only need exact lookups, a [hash map](/lesson/hash-maps) is faster than both. Sorted data wins when you need order: ranges, the smallest, the largest, the next one.

## Remember

- Linear search is O(*n*). Binary search on sorted data is O(log *n*).
- Good sorts are O(*n* log *n*). Simple sorts are O(*n*²).
- Use the language's built-in sort. Know whether it is stable.
- Sort when you search many times or need order. Use a hash map for exact lookups.

::quiz
? About how many steps does binary search need for a sorted list of 1,000,000 items?
- 1,000
+ 20
- 500,000
! Each step halves the list. 2²⁰ is about a million, so about 20 halvings find any item.
? You must find one value in an unsorted list, once. Should you sort first and then binary search?
+ No: sorting costs more than one linear search
- Yes: binary search is always faster
- Yes: unsorted lists cannot be searched
! Sorting is O(*n* log *n*), which is more than the O(*n*) of a single linear search. Sort only when you search many times.
::end
