---
minutes: 7
tech: []
refs:
  - llamacpp: README, on supported models and quantisation
  - aieng: Ch. 9, “Inference Optimization”
---
Open-weight models can run on your own laptop or desktop, with no internet connection and no data leaving the machine. The models that fit are smaller than the largest hosted ones, but they are useful for many tasks, and running one is the best way to see how inference really works.

## Why run locally

- **Privacy**: sensitive documents never leave your machine.
- **Offline** use.
- **No per-token cost** once you have the hardware.
- **Control**: fixed versions, any fine-tuning, no rate limits.
- **Learning**: you see memory, speed and quantisation trade-offs directly.

## What fits

Memory is the limit. The weights must fit in the GPU's memory, or in system memory for computers whose GPU shares it, with room for the KV cache, as [How text is generated](/lesson/generation) explained.

Rough sizes for the weights:

| Model size | 16-bit | 4-bit quantised |
|---|---|---|
| 3 billion parameters | about 6 GB | about 2 GB |
| 8 billion | about 16 GB | about 5 GB |
| 70 billion | about 140 GB | about 40 GB |

So a laptop with 16 GB of memory runs 3- to 8-billion-parameter models comfortably at 4 bits; 70-billion models need a high-end machine. [Distillation and quantisation](/lesson/small-models) is what makes this possible.

## How fast

Generation speed is mostly memory bandwidth divided by model size, as [Memory is the bottleneck](/lesson/memory-bandwidth) explained. A 5 GB model on hardware that reads 100 GB/s runs at roughly 20 tokens per second at best; a GPU with much higher bandwidth runs it far faster. Long prompts add prefill time.

## Tools

- **llama.cpp**: efficient inference on CPUs and GPUs, using quantised model files (GGUF format).
- **Ollama** and **LM Studio**: easy installers and a local server built on such engines, with a chat interface or an API that many tools can call.
- **Hugging Face Transformers**: the flexible Python library, more suited to development and fine-tuning.

## What to expect

- Good for: summarising and rewriting, extraction, classification, simple coding help, private document search with [RAG](/lesson/rag).
- Weaker at: complex reasoning, long agent tasks, broad knowledge, and less common languages, compared with the strongest hosted models.
- Check the **licence**: open-weight models come with different terms for commercial use.

> **In practice.** Evaluate a local model on your own task, as with any model. A small model that does one job reliably is often more useful than a large one you cannot afford to run.

## Remember

- Local models give privacy, offline use, control and no per-token cost.
- Memory limits size: at 4 bits, 8-billion-parameter models fit most modern laptops.
- Speed is mostly memory bandwidth divided by model size.
- Use llama.cpp, Ollama or LM Studio; check licences and evaluate on your task.

::quiz
? About how much memory do the weights of an 8-billion-parameter model need at 4 bits?
+ About 4 to 5 GB
- About 16 GB
- About 1 GB
! 8 billion × 0.5 bytes = 4 GB, plus small overheads.
? A team must summarise confidential legal files and may not send them to outside services. What fits?
+ An open-weight model run on their own hardware
- A hosted API with the files pasted in
- No model can help
! Local inference keeps the documents on machines the team controls.
::end
