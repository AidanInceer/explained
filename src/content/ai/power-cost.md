---
minutes: 7
tech: []
refs:
  - hennessy: Ch. 6, “Warehouse-Scale Computers to Exploit Request-Level and Data-Level Parallelism”
  - aieng: Ch. 9, “Inference Optimization”
---
AI runs in **datacentres**: buildings full of servers, networks, power supplies and cooling. Training a frontier model can occupy tens of thousands of GPUs for months; serving it to millions of users runs day and night. The costs, in money, electricity and water, are now large enough to shape which models get built and how they are used.

## Where the power goes

- **Chips**: a single data-centre GPU can draw around 700 watts or more under load. A server with eight of them, plus processors and memory, draws several kilowatts.
- **Cooling**: almost all that electricity ends up as heat, which must be removed with air or liquid cooling.
- **Networking and storage**: smaller, but significant at scale.

Datacentres report **power usage effectiveness** (PUE): total facility power divided by the power used by computing. A PUE of 1.1 means 10% extra for cooling and everything else. Efficient modern sites get close to that; older ones are much higher.

## Training and inference

- **Training** is a large, one-off cost per model: weeks or months on thousands of chips.
- **Inference**, running the model for users, is a cost per request, forever. For a widely used model, total inference cost over its life can exceed its training cost.

For people who build with AI, inference cost is what matters day to day. It grows with:

- **Model size**: bigger models read more weights per token, as [Memory is the bottleneck](/lesson/memory-bandwidth) explained.
- **Tokens**: both input and output. Long prompts and long answers cost more.
- **Latency targets**: answering instantly needs more hardware than answering in a minute.

## Making it cheaper

- Use the **smallest model** that does the job well. The lesson on cost, speed and model choice covers this.
- **Quantise** and **distil** models, so they need less memory and compute.
- **Batch** requests, and **cache** results and repeated prompt parts.
- Keep prompts short and relevant.

## Wider costs

- **Electricity**: large AI datacentres need as much power as a small city. Where it comes from, and whether it is low-carbon, decides the climate effect.
- **Water**: some cooling systems evaporate water, which matters in dry regions.
- **Chips**: making advanced chips is itself energy- and resource-intensive, and supply is limited.

> **In practice.** Estimates of "the energy of one AI query" vary widely and change quickly as hardware and models improve. Be suspicious of a single number; ask what model, what hardware and what was counted.

## Remember

- Datacentres turn electricity into computation and heat; cooling adds overhead (PUE).
- Training is a large one-off cost; inference is a cost on every request, for the model's whole life.
- Inference cost grows with model size, tokens and speed targets.
- Use smaller, quantised models, batching and caching. Consider electricity, water and chips.

::quiz
? A datacentre's computing equipment uses 10 MW, and the whole site uses 12 MW. What is its PUE?
+ 1.2
- 0.83
- 2
! PUE = total facility power / IT power = 12 / 10 = 1.2.
? For a model used by millions of people every day, which cost can grow larger over time?
+ Inference, because it is paid on every request for as long as the model is used
- Training, because it happens every day
- Neither
! Training is paid once; inference accumulates with every use.
::end
