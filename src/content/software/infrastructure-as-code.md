---
minutes: 8
tech: []
refs:
  - terraform: “What is Terraform?”, and “Core workflow”
  - sre: Ch. 7, “The Evolution of Automation at Google”
---
Clicking through a cloud console to create a server works once. Then someone asks how staging differs from production, or the region fails and everything must be rebuilt, and nobody remembers which boxes were ticked. **Infrastructure as code** (IaC) describes servers, networks, databases and permissions in files, kept in Git, reviewed and applied by tools like any other code.

## Declare what you want

Most IaC tools are **declarative**: you write the result you want, and the tool works out the steps.

```hcl
resource "aws_s3_bucket" "uploads" {
  bucket = "shop-uploads-prod"
}

resource "aws_db_instance" "main" {
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t4g.medium"
}
```

This is Terraform (and its open fork OpenTofu). Others include Pulumi, which uses normal programming languages, and each cloud's own tool, such as AWS CloudFormation.

## Plan, then apply

The usual workflow:

1. Change the files on a branch.
2. Run **plan**: the tool compares the files with what exists and lists exactly what it would create, change or destroy.
3. Review the plan in a pull request, with the code.
4. **Apply** the plan, ideally from CI rather than a laptop.

The plan step catches surprises before they happen: "destroy database `main`" in a plan is a lot better found in review than in production.

## State

The tool keeps a record, its **state**, of which real resources match which parts of the code. Store it in a shared, locked location, not on one person's laptop, so two people cannot apply changes at once and corrupt it.

## What you gain

- **Reproducible**: build staging and production from the same code with different settings, so they stay alike.
- **Reviewable**: infrastructure changes get the same review, history and rollback as code.
- **Documented**: the files are an exact description of what exists.
- **Recoverable**: rebuild a whole environment from the files after a disaster.

## Drift

When someone changes a resource by hand in the console, the real world no longer matches the code. This is **drift**. The next apply may undo the manual change, or fail. Make the code the only way to change infrastructure, and run a regular plan to detect drift.

> **Pitfall.** Destroying is as easy as creating. Protect important resources, such as databases and storage, with deletion protection, and read every plan that destroys something.

## Remember

- IaC describes infrastructure in files, kept in Git and reviewed.
- Declare the result; the tool plans the steps. Review the plan before you apply.
- Keep state shared and locked. Apply from CI.
- Avoid manual changes: they cause drift. Protect resources that must not be deleted.

::quiz
? A plan shows that applying it will destroy and recreate the production database. What should you do?
+ Stop and find out why, before applying
- Apply it: the tool knows best
- Apply it at night
! A plan exists to show surprises before they happen. A destroyed database means lost data.
? Someone changed a firewall rule by hand in the console. What is the problem?
+ The real infrastructure has drifted from the code, and the next apply may undo or conflict with it
- None
- The console change is automatically added to the code
! Manual changes are not in the code, so the code no longer describes the truth.
::end
