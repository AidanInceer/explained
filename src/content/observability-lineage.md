[Data tests](/lesson/data-quality) find the problems that you thought of. This lesson is about three practices for the other problems: to find out that something is wrong, to find what it affects, and to prevent the cause at the source.

## Observability: know before the user does

The worst way to find a data problem is a message from a manager: "this number looks wrong". Data observability is continuous monitoring of the data, so that the team knows first.

Five signals are monitored for each important table:

| Signal | Question | Example of an alert |
|---|---|---|
| Freshness | When was the table last updated? | `orders` is normally updated by 06:00. It is 08:00 and it is not |
| Volume | How many rows arrived? | Today's load has 40% fewer rows than a normal Tuesday |
| Schema | Did the columns or types change? | The column `amount` changed from decimal to string |
| Distribution | Do the values look normal? | The null rate of `country` went from 1% to 35% |
| Lineage | What is upstream and downstream? | See the next section |

The first three are cheap to collect, from warehouse metadata alone, and they find a large part of incidents. Start with those.

The difference from a test: a test is an exact rule that you write, such as "never null". A monitor learns what is normal and reports a deviation. Use tests for the rules that you know. Use monitors for the changes that you did not expect.

### Service levels for data

Take the practice from site reliability engineering. For an important table, agree on a measurable target with its users: "`fact_sales` is complete for the previous day by 07:00, on 99% of days". Then measure it. This changes "the data is sometimes late" into a number that the team can manage, and it shows which tables are important enough to wake someone for.

## Lineage: what does this affect?

**Lineage** is the record of how data moves: which tables and columns each table is built from, and which tables, dashboards and models use it.

It answers two questions in an incident:

- **Impact analysis, downstream.** "The `customers` load failed. Which dashboards are wrong, and who must be informed?"
- **Root cause analysis, upstream.** "This revenue number is wrong. Which of its inputs changed?"

It also answers two questions about change:

- "Can I remove this column? Does anything read it?"
- "Where does this personal data go?" This is necessary for privacy regulation. See [Governance and security](/lesson/governance-security).

Lineage is collected automatically, by parsing the SQL that builds each table, from the references in tools such as dbt, or from events that the orchestrator emits. OpenLineage is an open standard for those events. Lineage that is drawn by hand is out of date within a week.

**Column-level lineage** follows individual columns through transformations. It is harder to collect and much more useful. "Something upstream changed" becomes "this column comes from that field".

## Data contracts: prevent the cause

Many incidents have the same origin. A team that owns a source system changes it. They rename a column, change a type, or change what a status value means. Their application works. Your pipeline does not, or it continues and gives wrong results. They did not know that anyone depended on that table.

A **data contract** is an explicit agreement between a producer of data and its consumers. It usually specifies:

- **The schema.** Column names, types, and which columns can be null.
- **The meaning.** What a row is, what each column means, and the units.
- **The guarantees.** Freshness, and the quality rules that the producer will satisfy.
- **How it can change.** For example: new optional columns can be added at any time. A removal or rename needs notice and a new version.
- **The owner.** Who to contact.

A contract in a document is only a hope. A real contract is **enforced by a machine**. The schema is in a file in version control, and the producer's CI fails if a change breaks it. For event streams, a *schema registry* does this. It refuses a new schema version that is not compatible with the one before.

The contract moves the detection to the left. The defect is found in the producer's pull request, and not in your dashboard three days later.

> **From the community.** In discussions of data contracts on r/dataengineering, the usual conclusion is that the technology is the easy part. The difficult part is to get the producing teams to accept ownership of the data that they emit. A small contract on the five most critical tables, which the producers have agreed to, is worth more than a full specification that nobody enforces.

## How the three connect

1. **Contracts** prevent the changes that would break the pipeline.
2. **Tests** find the known kinds of bad data that still arrive.
3. **Observability** finds the kinds that you did not think of.
4. **Lineage** shows what is affected and where to look.

## Remember

- Monitor freshness, volume and schema on each important table. They are cheap and find most incidents.
- Lineage shows what a table is built from and what uses it. Collect it automatically.
- A data contract is a schema and a set of guarantees that the producer's CI enforces.

::quiz
? The daily load of a table has 5% of its normal row count. No test failed, because all the rows that arrived were valid. Which signal finds this?
- Schema
+ Volume
- Lineage
! Each row satisfied the rules, but most rows were missing. A volume monitor compares the count with what is normal.
? You want to remove a column from a table. Which tool shows if that is safe?
+ Lineage, downstream of the column
- A freshness monitor
- A <code>not_null</code> test
! Column-level lineage lists each model and dashboard that reads the column.
? What makes a data contract effective?
- A detailed document that all teams have read
+ An automatic check in the producer's release process that stops a change that breaks it
- A meeting each month
! A contract that is not enforced depends on people remembering it. A check in CI stops the change before release.
::end
