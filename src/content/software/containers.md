---
minutes: 9
tech: []
refs:
  - docker: Get started, “What is a container?” and “What is an image?”
  - ostep: 'Ch. 4, “The Abstraction: The Process”, on isolation between processes'
---
"It works on my machine" has ended many afternoons. The program needs a certain version of Python, certain system libraries, certain files in certain places, and the server has something slightly different. A **container** packs the program together with everything it needs to run, so it runs the same on a laptop, in CI and in production.

## Image and container

- An **image** is a read-only package: a small file system with the operating system libraries, the runtime, your code and its dependencies, and the command to start.
- A **container** is a running instance of an image. You can run many containers from one image.

Docker made this popular. Today the image format is a standard (OCI), and many tools build and run the same images.

## A Dockerfile

An image is built from a recipe:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock
COPY . .
USER 1000
CMD ["python", "-m", "shop.server"]
```

Each line adds a **layer**. Layers are cached: if only your code changed, the dependency layer is reused and the build takes seconds. That is why the lock file is copied and installed *before* the rest of the code.

## How it differs from a virtual machine

A **virtual machine** runs a whole guest operating system on emulated hardware. A container is a normal process on the host, which the host's kernel isolates: it gets its own view of the file system, the network and the process list, and limits on CPU and memory, using the same mechanisms as in [Operating systems](/lesson/operating-systems).

- Containers start in a fraction of a second and use little extra memory.
- All containers on a host share its kernel, so isolation is weaker than between virtual machines. Do not treat a container as a strong security wall.

## Good images

- **Small**: start from a slim base image. Less to download, less to attack.
- **Pinned**: use exact base image versions, not `latest`.
- **Not root**: run as an ordinary user, as the `USER` line does, following [Least privilege](/lesson/least-privilege).
- **No secrets** in the image. Anyone who can pull it can read its layers. Pass secrets at run time.
- **One process per container**: the web server in one, the worker in another. Each can be scaled and restarted on its own.

## Containers are disposable

A container's own file system disappears when it is removed. Store anything lasting outside it: in a database, in object storage, or on a mounted **volume**. Treat containers as replaceable: start a new one rather than repairing a running one. This fits the stateless servers of [Scaling a service](/lesson/scaling).

> **In practice.** For local development, **Docker Compose** starts your app with its database and cache from one file, so a new developer runs one command instead of installing everything by hand.

## Remember

- An image packs the program with everything it needs; a container is a running copy.
- Containers are isolated processes sharing the host's kernel, not small virtual machines.
- Keep images small, pinned, without secrets, and running as a normal user.
- Containers are disposable. Keep lasting data outside them.

::quiz
? Why copy the lock file and install dependencies before copying the rest of the code in a Dockerfile?
+ So the dependency layer is cached and reused when only the code changes
- Docker requires that order
- To make the image smaller
! Layers are cached in order. Putting slow, rarely changing steps first makes rebuilds fast.
? A service writes uploaded files to its container's file system. What happens on the next deploy?
+ The files are lost, because the new container starts from the image
- They are copied to the new container
- Nothing changes
! Container file systems are disposable. Store uploads in object storage or a volume.
::end
