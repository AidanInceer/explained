---
minutes: 8
tech: []
refs:
  - islp: Ch. 12, “Unsupervised Learning”
  - mml: Ch. 10, “Dimensionality Reduction with Principal Component Analysis”
---
With no labels, a model can still find structure: groups of similar items, and the few directions in which data varies most. **Clustering** finds groups. **Dimension reduction** describes each item with fewer numbers while keeping what matters. Both are used to explore data, to prepare features, and to make high-dimensional data visible.

## Clustering with k-means

**K-means** splits data into k groups:

1. Pick k starting centres, for example at random points.
2. Assign every point to its nearest centre.
3. Move each centre to the average of the points assigned to it.
4. Repeat steps 2 and 3 until nothing changes.

The result: k clusters, each a group of points closer to its own centre than to any other.

Things to know:

- **You choose k.** Try several and look at how much the within-cluster distance falls; the "elbow" where gains slow is a common guide. Often the business decides: "we want five customer segments".
- **It finds round, similar-sized groups.** Long, curved or very uneven clusters need other methods, such as DBSCAN, which groups points in dense regions, or hierarchical clustering, which builds a tree of nested groups.
- **Scale matters**: distances depend on units, so standardise features first, as in [Features and representations](/lesson/features).
- **Different starts can give different results.** Run it several times.

::fig ai-kmeans | Run k-means one step at a time: assign each point to a centre, then move each centre.

## Dimension reduction with PCA

Data often has many features that move together. **Principal component analysis** (PCA) finds new axes, the **principal components**:

- The first is the direction in which the data varies most.
- The second is the direction of most remaining variation, at a right angle to the first.
- And so on.

Keep the first few components, and you describe each item with a few numbers, losing as little variation as possible. PCA is computed from the [singular value decomposition](/lesson/eigen) of the centred data.

Uses: compress features before another model; remove noise; plot high-dimensional data in 2D to look at it.

## Seeing embeddings

Embeddings from neural networks have hundreds of dimensions. To look at them, methods such as **t-SNE** and **UMAP** place each point in 2D so that neighbours stay neighbours. The pictures are useful for exploring, but distances between far-apart clusters, and cluster sizes, in such plots do not mean much.

## Caution

Unsupervised methods always produce an answer: k-means returns k clusters even for data with no real groups. Check that clusters are stable, that they mean something to people who know the domain, and that they are useful for the decision you need to make.

## Remember

- K-means: assign points to the nearest centre, move centres to the average, repeat.
- Choose k with care, standardise features, and run several starts.
- PCA finds the directions of greatest variation; keep a few to reduce dimensions.
- t-SNE and UMAP show embeddings in 2D; read them loosely. Clusters always appear; check they mean something.

::quiz
? In k-means, what happens in the step after every point has been assigned to its nearest centre?
+ Each centre moves to the average of its assigned points
- The points move to the centres
- k is increased by one
! Assign, then update the centres, then repeat until stable.
? The first principal component of a dataset is…
+ The direction in which the data varies most
- The feature with the largest values
- The first column of the table
! PCA orders new axes by how much variation they capture.
::end
