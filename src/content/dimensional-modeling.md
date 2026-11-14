Dimensional modeling is the most widely used method for designing analytic tables. Ralph Kimball described it in the 1990s. It is still the default because it matches how people ask questions.

## Facts and dimensions

Listen to a business question: "What was the **revenue** by **product category** and **month** for **stores in the north**?"

It has two parts. There is a number to add up: revenue. And there are things to group and filter by: category, month, region. Dimensional modeling gives each part its own kind of table.

- A **fact table** holds measurements of events. One row is one event: a sale, a click, a shipment. Its columns are numeric measures, such as `quantity` and `amount`, and keys to dimensions. Fact tables are long and narrow.
- A **dimension table** holds the context: who, what, where, when. One row is one customer, one product, one date. Its columns are descriptive text. Dimension tables are short and wide.

::fig star | A star schema. The fact table is in the centre, and each dimension is one join away.

The drawing looks like a star, which gives the design its name. Every question has the same form: join the fact to the dimensions you need, filter and group by dimension columns, aggregate fact columns.

```sql
SELECT p.category, d.month, SUM(f.amount) AS revenue
FROM fact_sales f
JOIN dim_product p ON p.product_key = f.product_key
JOIN dim_date    d ON d.date_key    = f.date_key
JOIN dim_store   s ON s.store_key   = f.store_key
WHERE s.region = 'North'
GROUP BY p.category, d.month;
```

## Declare the grain first

The **grain** is the exact meaning of one row of the fact table. "One row for each product on each receipt" is a grain. "Sales" is not.

Kimball's design procedure has four steps, in this order:

1. Choose the business process, for example retail sales.
2. **Declare the grain.**
3. Choose the dimensions that apply at that grain.
4. Choose the facts that are measured at that grain.

The most common modeling defect is a fact table with mixed grain, for example order-level shipping cost stored on each order line. Add up the column and the shipping cost is counted once for each line. Use the lowest grain you can. You can always aggregate up, and you can never divide down.

## Three kinds of fact table

| Kind | One row is | Example |
|---|---|---|
| Transaction | One event | Each sale line |
| Periodic snapshot | One entity in one period | Each account's balance at the end of each day |
| Accumulating snapshot | One process instance, updated as it moves | One order, with dates for placed, packed, shipped, delivered |

Also check whether a fact is **additive**. Revenue can be added across all dimensions. An account balance can be added across accounts but not across days. A ratio such as margin percent cannot be added at all. Store its two parts and divide after you aggregate.

## Dimension details

**Surrogate keys.** A dimension gets a key that the warehouse generates, such as `customer_key`, in place of the source's id. This protects the warehouse from changes in the source, lets several source systems be combined, and makes history possible. See [Slowly changing dimensions](/lesson/scd).

**Denormalize the dimension.** `dim_product` holds `category` and `brand` as plain columns, although in 3NF they would be separate tables. If you normalize them, you get a *snowflake schema*: fewer repeated strings, more joins. Kimball's advice is to keep the star. Dimensions are small and the simpler queries are worth more than the saved space.

**The date dimension.** A table with one row for each calendar day, with columns such as `month`, `quarter`, `is_weekend` and `fiscal_period`. It moves calendar logic out of every query and into one table.

**Conformed dimensions.** If `fact_sales` and `fact_returns` both use the same `dim_product`, you can compare sales and returns by product. Shared dimensions are what make separate fact tables work as one warehouse.

> **For experienced readers.** On a column store, a join to a small dimension is cheap, and some teams pre-join everything into one wide table. That is a serving optimisation, not a replacement. The grain, the conformed dimensions and the additivity rules still decide whether the numbers are correct. See [Inmon, Data Vault and wide tables](/lesson/modeling-styles).

## Remember

- Facts are measurements of events. Dimensions are the context you filter and group by.
- Declare the grain before anything else, and do not mix grains in one table.
- Shared, conformed dimensions connect fact tables.

::quiz
? A fact table has one row for each order line. Someone adds an <code>order_discount</code> column that holds the discount for the full order on every line. What is wrong?
- Nothing. More columns are useful
+ The column has a different grain, so a SUM counts the discount several times
- Discounts must be in a dimension
! An order with three lines shows its discount three times. Allocate the discount to the lines, or put it in a separate order-grain fact table.
? Which of these is a dimension attribute and not a fact?
- <code>quantity_sold</code>
+ <code>product_category</code>
- <code>amount</code>
! You group and filter by category. You add up quantity and amount.
? An account balance is recorded each day. Can you SUM the balance over a month to get a useful number?
- Yes
+ No. A balance is semi-additive. Use the average or the last value
! Adding 30 daily balances gives a number with no meaning. Balances add across accounts but not across time.
::end
