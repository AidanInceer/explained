---
minutes: 8
tech: []
refs:
  - k8s: Concepts, “Overview”, “Workloads” and “Services, Load Balancing, and Networking”
---
One container is easy to run. Fifty containers of ten services, spread over twenty machines, are not: something must decide where each runs, restart those that crash, replace machines that fail, route traffic, and roll out new versions without downtime. An **orchestrator** does this. **Kubernetes** is the most common one.

## What an orchestrator does

You tell it the **desired state**: "run four copies of the web service, version 2.3, each with half a CPU and 512 MB of memory". It makes it so, and keeps it so:

- **Scheduling**: picks a machine with enough free resources for each container.
- **Self-healing**: restarts containers that crash, and moves them off machines that fail.
- **Scaling**: adds or removes copies, by hand or automatically from load.
- **Service discovery and load balancing**: gives each service a stable name and spreads traffic over its healthy copies.
- **Rolling updates**: replaces old copies with new ones a few at a time, and stops if the new ones are not healthy.
- **Configuration and secrets**: hands settings to containers at start-up.

## Kubernetes in a few words

- A **pod** is one or more containers that run together; usually one.
- A **deployment** says how many copies of a pod to run, and how to update them.
- A **service** gives a stable address to a set of pods.
- **Health checks** (probes) tell Kubernetes whether a container is alive and ready for traffic.

You describe these in YAML files, which are a form of [infrastructure as code](/lesson/infrastructure-as-code), and Kubernetes keeps reality matching them.

## Do you need one?

Kubernetes is powerful and complicated. Running it well takes real skill and time: upgrades, networking, security, monitoring of the cluster itself.

- **Probably not**, for a small team with a few services. A managed container platform, such as Google Cloud Run, Azure Container Apps or a PaaS, runs your containers, scales them and handles HTTPS, with almost nothing to operate.
- **Maybe**, when you run many services across several teams and need fine control.
- **If you do**, use a managed Kubernetes service from your cloud provider, so you do not run its control plane yourself.

> **Rule of thumb.** Choose the least complicated platform that runs your containers reliably today. Moving to an orchestrator later is a known path; running one you do not need is a cost every day.

## Health checks matter everywhere

Whatever runs your containers, give each service:

- A **liveness** check: "am I stuck?" If it fails, restart me.
- A **readiness** check: "can I take traffic now?" During start-up or overload, say no, and traffic goes elsewhere.

Without them, the platform sends users to containers that are starting, stuck or broken.

## Remember

- An orchestrator places, restarts, scales, routes and updates containers to match a desired state.
- Kubernetes: pods, deployments, services, probes, described in YAML.
- Small teams usually do better with a managed container platform.
- Give every service liveness and readiness checks.

::quiz
? A three-person team runs two web services. What platform is usually wise?
+ A managed container platform that handles scaling and HTTPS
- A self-managed Kubernetes cluster
- Twenty virtual machines
! An orchestrator's power comes with daily operating cost. A managed platform gives most of the benefit with little work.
? A container is starting up and cannot yet serve requests. Which check stops traffic reaching it?
+ The readiness check
- The liveness check
- The build
! Readiness says whether to send traffic now. Liveness says whether to restart.
::end
