---
minutes: 9
tech: []
refs:
  - clrs: Ch. 20, “Elementary Graph Algorithms”, and Ch. 22, “Single-Source Shortest Paths”
---
Two graph problems come up again and again in everyday software: "what is the shortest way from here to there?" and "in what order should these dependent tasks run?". Both have well-known algorithms. You will rarely write them yourself, but you will use tools that do, and you need to know what they can promise.

## Shortest path with no weights

When every edge costs the same, such as "steps between two people in a social network", **breadth-first search** finds the shortest path. It visits the start node, then all nodes one step away, then all nodes two steps away, and so on. The first time it reaches the target, it has used the fewest steps. To get the path itself, record for each node which node it was reached from, then follow that record back from the target.

## Shortest path with weights

On a road map, edges have distances, and the route with the fewest roads is not always the shortest. **Dijkstra's algorithm** handles weights that are zero or more:

1. Give the start a distance of 0, and every other node a distance of infinity.
2. Take the unvisited node with the smallest known distance. Mark it visited: its distance is now final.
3. For each of its neighbours, check whether going through this node gives a shorter distance. If so, update it.
4. Repeat until the target is visited.

With a priority queue to find the smallest distance quickly, it runs in about O(*E* log *V*), where *E* is the number of edges and *V* the number of nodes.

> **Pitfall.** Dijkstra's algorithm gives wrong answers if any edge has a negative weight, because it assumes that a node's distance is final once visited. The Bellman–Ford algorithm handles negative weights, more slowly.

Route planners and network routers use these ideas, with many improvements, such as precomputed shortcuts and estimates that steer the search towards the target.

::fig sw-graph | Dijkstra's algorithm on a small road map, one place at a time.

## Dependencies: topological sort

A build system must compile a library before the code that uses it. A course must teach a lesson before the lessons that need it. These are graphs where an edge A → B means "A must come before B".

A **topological sort** puts the nodes in an order where every edge points forward. One way to do it:

1. Find all nodes with no incoming edges. They can go first.
2. Output one of them, and remove its outgoing edges.
3. Some nodes now have no incoming edges. Repeat.

If nodes remain but none is free, the graph has a **cycle**: A needs B, and B needs A. No valid order exists, and the tool must report the cycle, not loop for ever.

Build tools, package managers, spreadsheet recalculation, task schedulers such as Airflow, and the lesson maps on this site all rely on this. The site's own build stops when a lesson would need to come before one of its own prerequisites.

## Other common problems

- **Connected components**: which nodes can reach each other at all. Depth-first search finds them.
- **Minimum spanning tree**: the cheapest set of edges that connects every node, for example the least cable to join every building.
- **Cycle detection**: find a dependency loop before it causes a deadlock or an endless build.

## Remember

- Breadth-first search finds the fewest steps when every edge costs the same.
- Dijkstra's algorithm finds the shortest path with weights that are not negative.
- A topological sort orders tasks so that each comes after what it depends on.
- A cycle means that no valid order exists. Good tools report it.

::quiz
? A package manager finds that package A needs B, B needs C, and C needs A. What should it do?
+ Report a dependency cycle, because no install order can satisfy all three
- Install them in alphabetical order
- Install A twice
! A topological sort is impossible when the graph has a cycle. Reporting it is the only correct answer.
? Which algorithm finds the route with the fewest train changes, if every change counts the same?
+ Breadth-first search
- Dijkstra's algorithm with negative weights
- Topological sort
! With equal costs, breadth-first search reaches the target first along the path with the fewest steps.
::end
