---
minutes: 8
tech: []
refs:
  - zero: Sections 1, 5 and 7, on partitioning and its communication cost
  - megatron: Sections 1 and 3
---
[Many chips together](/lesson/many-chips) introduced the ways to split a model across GPUs. This lesson looks at what it is like to run such a training job in practice: making the parallelism efficient, keeping thousands of chips busy, surviving failures, and knowing whether the run is healthy.

## Choosing the split

The usual plan, from inside out:

1. **Tensor parallelism** within a server of 4 to 8 GPUs joined by the fastest links.
2. **Pipeline parallelism** across a few servers, for models too deep for one server's memory.
3. **Sharded data parallelism** across everything else, so weights, gradients and optimiser state are spread out, as ZeRO and FSDP do.

The mix depends on the model's size, the cluster's network, and how much memory activations need. Libraries such as PyTorch FSDP, DeepSpeed and Megatron-LM, and JAX's sharding tools, do most of the work.

## Keeping chips busy

The measure that matters is **model FLOPs utilisation** (MFU): the share of the hardware's peak arithmetic that goes into useful training. Well-run large jobs often reach about 40–60%. The rest is lost to:

- **Communication**: waiting for gradients or activations from other GPUs. Good systems **overlap** communication with computation: send one layer's gradients while computing the next.
- **Pipeline bubbles**: GPUs idle while the pipeline fills and drains. More, smaller micro-batches shrink them.
- **Memory traffic**, as [Memory is the bottleneck](/lesson/memory-bandwidth) explained.
- **Recomputation**: to save memory, some activations are not stored but computed again in the backward pass.

## Global batch size

With data parallelism, each GPU processes its own part of the batch, so the **global batch** is the sum. Thousands of GPUs give batches of millions of tokens. Larger batches need adjusted learning rates and warm-up, as [Learning rate](/lesson/learning-rate) noted, and beyond some size they stop helping.

**Gradient accumulation** gives a large effective batch on few GPUs: add up gradients over several small batches, then take one step.

## Failures are normal

At this scale, something fails every few hours or days: a GPU, a memory error, a network link, a whole server.

- Save **checkpoints** often enough that losing the work since the last one is acceptable.
- Detect failed or slow nodes automatically, replace them, and restart from the checkpoint.
- Make the data loader resumable, so restarting does not repeat or skip data.

## Watching a run

Teams watch:

- [Loss curves](/lesson/loss-curves), for spikes and divergence. Large runs sometimes roll back to a checkpoint and skip the batches that caused a spike.
- Throughput and MFU, to catch slow nodes.
- Gradient norms and the size of activations, as early signs of instability.

> **For new readers.** Most people never run training at this scale. Knowing how it works still helps to understand why large models cost what they do, and why they come from a small number of organisations.

## Remember

- Combine tensor, pipeline and sharded data parallelism, from fastest links outward.
- Utilisation is lost to communication, pipeline bubbles and memory; overlap work to hide it.
- Global batch size grows with GPUs; adjust the learning rate, or accumulate gradients on few GPUs.
- Failures are routine: checkpoint, detect, restart. Watch loss, throughput and stability signals.

::quiz
? A run on 1,000 GPUs reaches 25% MFU. What does that mean?
+ Only a quarter of the hardware's peak arithmetic is used for useful training work
- 25% of the GPUs have failed
- The model is 25% trained
! MFU is the share of peak FLOP/s turned into useful model computation.
? You have one GPU but want the effect of a batch 8 times larger than fits in memory. What can you do?
+ Accumulate gradients over 8 small batches, then take one step
- Use a learning rate 8 times larger with the small batch
- It is impossible
! Gradient accumulation sums gradients across several batches before each update.
::end
