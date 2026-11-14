---
minutes: 9
tech: []
refs:
  - zero: Section 1, “Extended Introduction”, and Section 5, on partitioning optimiser state, gradients and weights
  - megatron: Section 3, “Model Parallel Transformers”
  - pmpp: Ch. 20, “Programming a Heterogeneous Computing Cluster”
---
The largest models do not fit on one chip, and training them on one chip would take decades, as [How a chip computes](/lesson/how-chips-compute) estimated. So training spreads the work over thousands of GPUs. There are a few ways to split it, each with its own cost in communication between chips.

## The memory problem

Training needs, for every weight:

- the weight itself,
- its gradient,
- the optimiser's state: two more numbers for Adam, as [Momentum and Adam](/lesson/momentum-adam) explained,
- often a 32-bit master copy.

That can be 16 bytes or more per weight. A 70-billion-weight model needs over a terabyte for these alone, before the activations of the training examples. One GPU holds around 80 to 200 GB.

## Data parallelism

Every GPU holds a **full copy** of the model. Each gets a **different part of the batch**, computes gradients on it, and then the GPUs **average their gradients** together, so every copy takes the same step.

- Simple, and scales well, as long as the model fits on one GPU.
- The averaging, an **all-reduce**, sends gradients between all GPUs every step, which needs a fast network.

**Sharded** data parallelism (such as ZeRO or FSDP) splits the weights, gradients and optimiser state across the GPUs, and gathers each layer's weights just when it is needed. The model no longer has to fit on one GPU.

## Model parallelism

Split the **model itself** across GPUs:

- **Tensor parallelism**: split each large matrix multiplication across several GPUs, each computing part of the result. Needs very fast links, because GPUs exchange data inside every layer. Usually kept within one server, whose GPUs are joined by special high-speed links.
- **Pipeline parallelism**: put different layers on different GPUs. A batch flows through them like an assembly line, split into small micro-batches so that GPUs are not left waiting for each other.

Large training runs combine all three: tensor parallelism inside a server, pipeline parallelism across a few servers, and data parallelism across many groups.

## The network

When thousands of GPUs work together, the network between them is as important as the chips. GPUs inside a server talk over very fast links; servers talk over specialised networks with high bandwidth and low delay. The slowest link sets the pace for everyone at every synchronisation.

## Failures

With 10,000 GPUs running for months, hardware fails often: a chip, a cable, a server. Training saves **checkpoints**, copies of all weights and optimiser state, regularly, so it can restart from the last one instead of from the start.

> **For experienced readers.** "Mixture of experts" models add expert parallelism: different experts live on different GPUs, and tokens are routed between them, which adds another kind of communication.

## Remember

- Training needs memory for weights, gradients and optimiser state: far more than one GPU holds for large models.
- Data parallelism: copies of the model on different data, gradients averaged each step. Sharding removes the copies.
- Tensor and pipeline parallelism split the model itself.
- Fast networks and regular checkpoints are as essential as the chips.

::quiz
? In data parallelism, what must the GPUs exchange at every step?
+ Their gradients, to average them so every copy takes the same step
- Their training data
- Nothing
! Each GPU sees different data; averaging gradients keeps the copies identical.
? Why is tensor parallelism usually kept within one server?
+ It exchanges data inside every layer, which needs the very fast links between GPUs in one server
- It needs less memory
- It cannot run on more than two GPUs
! Frequent, large exchanges need the fastest links available, which are inside a server.
::end
