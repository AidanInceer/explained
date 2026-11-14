---
minutes: 9
tech: []
refs:
  - clrs: Ch. 12, “Binary Search Trees”, Ch. 18, “B-Trees”, and Ch. 20, “Elementary Graph Algorithms”
---
Lists and hash maps hold flat collections. Much real data has shape: folders inside folders, a company's reporting lines, roads between towns, people who follow each other. **Trees** hold data with branches. **Graphs** hold data with any connections at all.

## Trees

A **tree** has one **root** node at the top. Each node can have **children**, and each child has exactly one **parent**. Nodes with no children are **leaves**.

Trees are everywhere in software:

- The file system: folders contain files and folders.
- The page in your browser: the HTML elements form a tree, the DOM.
- A program's source code: a compiler first turns it into a syntax tree.
- A JSON document: objects contain values, lists and objects.

## Binary search trees

A **binary search tree** keeps data sorted. Each node has at most two children, and for every node, all values in its left branch are smaller and all values in its right branch are larger.

To find a value, start at the root and go left or right at each node. Each step drops about half of what remains, as in binary search. If the tree is **balanced**, so that both sides of each node are about the same size, a search, an insert and a delete each take O(log *n*).

Unlike a [hash map](/lesson/hash-maps), a search tree keeps order. It can answer "every value between 100 and 200" or "the next value after 150" quickly. That is why database indexes are trees.

> **For experienced readers.** Databases use **B-trees**: each node holds hundreds of keys and has hundreds of children. The tree is only three or four levels deep even for billions of rows, so a lookup reads only a few blocks from storage.

## Balance matters

Insert sorted values into a simple search tree, and each new value goes to the right of the last. The "tree" becomes one long line, and searches become O(*n*). Balanced trees, such as red-black trees and B-trees, rearrange themselves on each insert to stay short. The ones in your language's library and in your database already do this.

## Graphs

A **graph** is a set of **nodes** (also called vertices) and **edges** that connect pairs of them. There is no root and no rule about parents. A graph can have loops.

- Edges can have a **direction**: "A follows B" is not "B follows A". A road network may have one-way streets.
- Edges can have a **weight**: the distance of a road, the cost of a flight.

Examples: road maps, social networks, links between web pages, and tasks that depend on other tasks, such as build steps or the lessons on this site's maps.

## Storing a graph

Two common ways:

- An **adjacency list**: for each node, a list of its neighbours. Compact, and good for most real graphs, where each node connects to only a few others.
- An **adjacency matrix**: a table with a row and a column for each node, and a mark where an edge exists. Fast to check one edge, and it takes *n*² space.

## Walking through a graph

Most graph work starts by visiting nodes along edges:

- **Breadth-first search** visits all neighbours first, then their neighbours. It finds the fewest steps between two nodes.
- **Depth-first search** follows one path as far as it goes, then backs up. It finds whether two nodes are connected, and finds loops.

Both must remember which nodes they have visited, or they go round loops for ever. [Graph algorithms](/lesson/graph-algorithms) builds on these.

## Remember

- A tree has one root, and each node has one parent. Files, HTML and JSON are trees.
- A balanced search tree keeps data sorted, with O(log *n*) operations and fast range queries.
- A graph is nodes and edges, with directions and weights, and may contain loops.
- Breadth-first and depth-first search visit a graph. Both track the nodes already seen.

::quiz
? Why do databases use trees, not hash maps, for most indexes?
+ Trees keep keys sorted, so they also answer range queries such as "between two dates"
- Trees use less memory than any other structure
- Hash maps cannot hold numbers
! A hash map only finds exact keys. A sorted tree finds a key and also everything near it.
? A search on a graph never ends. What is the most likely cause?
- The graph has too many nodes
+ The graph has a loop, and the search does not remember which nodes it has visited
- Graphs cannot be searched
! Without a record of visited nodes, a search follows a loop round and round.
::end
