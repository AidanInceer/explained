This design is about **machines that report on themselves**. The data is simple: a few numbers and a time. The difficulty is the volume, the unreliable connections, and the fact that one stream must serve users who need a minute and users who need ten years. The company and its numbers are invented for the example.

## The situation

A manufacturer operates 10,000 machines at 40 sites. Each machine has sensors for temperature, vibration and pressure, and sends one reading each second. A machine that overheats and is not stopped is damaged, and the production line stops with it.

::fig wb-iot | The design in ten steps. Use “Next step”, or “Expand” for a larger view.

## Step 1: users and requirements

| User | Need | Freshness | Notes |
|---|---|---|---|
| Maintenance team | An alert when a machine is in a dangerous state | Less than 1 minute | A false alert at night has a cost. A missed one has a larger cost |
| Operations room | The state of each site and machine | A few minutes | Charts of the last hours and days |
| Reliability engineers | Find patterns before a failure. Train a model | Daily | Need raw readings, for years |

Three users, three different stores. This is a design where [streaming](/lesson/batch-vs-streaming) is required: no batch job gives an alert in one minute.

## Step 2: numbers first

- 10,000 machines × 1 reading each second = **10,000 readings a second**.
- × 86,400 seconds = **864 million readings a day**.
- A reading is about 100 bytes raw, so about 86 GB a day raw, and perhaps 6 to 10 GB a day as [Parquet](/lesson/file-formats), because sensor values compress very well.
- Ten years of history is about 30 TB of Parquet.

These numbers decide several things. An insert of one row at a time into a normal database will not work. A dashboard cannot read raw readings for a week of one site: that is 150 million points. And the lake is affordable for the full history.

## Step 3: the model

| Store | Grain | For |
|---|---|---|
| Raw readings, in the lake | One reading: machine, sensor, time, value | Engineers, and rebuilds |
| `machine_minute` | One machine in one minute: minimum, average, maximum, count for each sensor | Dashboards |
| `machine_hour`, `machine_day` | The same, at coarser grain | Long charts |
| `alert` | One alert: machine, rule, start, end | Maintenance, and later analysis |
| `dim_machine` | One version of a machine: type, site, line, install date | [Type 2](/lesson/scd), because machines are moved and rebuilt |

The reduction from seconds to minutes is called **downsampling**. Keep the count with each aggregate: a minute with 12 readings in place of 60 tells you that the connection was bad.

## Step 4: from the machine to the cloud

**The edge gateway.** Machines speak industrial protocols and are not on the internet. A gateway at each site collects their readings, adds a time, and sends them on. Two properties of the gateway shape everything after it:

- It **buffers** when the site is offline, and sends the stored readings later. So data can arrive hours or days late, in a large burst.
- Its **clock** can be wrong. A reading must carry the time of the event, and the cloud adds the time of receipt, so that a bad clock can be seen.

**The protocol.** Gateways use **MQTT**, a light publish-subscribe protocol for devices, to a managed IoT hub (AWS IoT Core, Azure IoT Hub, or an MQTT broker). The hub handles one certificate for each device and many thousands of long connections.

**The log.** The hub writes to [Kafka](/lesson/streaming-basics), with the machine ID as the key. All readings of one machine are then in one partition, in order. Kafka is the buffer between a source that cannot be slowed and consumers that can stop.

## Step 5: three consumers

### Alerts: a stream processor

A [Flink](/lesson/stream-engines) job keeps state for each machine. For each one-minute [window](/lesson/worked-streaming-window), by event time, it computes the average temperature and compares it with the limit for that type of machine.

Why a window, and not each reading? Sensors are noisy. One reading of 140 degrees between two readings of 80 is an error of the sensor. A minute at 140 is a fire. Rules on windows reduce false alerts.

Good alert rules also have **hysteresis**: the alert starts above 120 and ends below 110, so that a value moving around the limit does not start and end an alert twenty times.

The limits come from the `dim_machine` data, loaded into the job as reference state.

### Dashboards: downsample into a time-series store

A second job writes one row for each machine for each minute into a [time-series store](/lesson/operational-stores), such as TimescaleDB, InfluxDB or ClickHouse. These stores are built for “the values of machine X between two times”, and they can roll minutes into hours and days and remove old detail automatically.

A chart then chooses its grain from its time range: minutes for a day, hours for a month.

### History: everything to the lake

A loader writes all raw readings as Parquet, partitioned by date and site. Engineers query it with Spark or a SQL engine and join it to `dim_machine`. The lake is also the source for a rebuild, if a downsampling rule changes.

## Step 6: late data and bad data

**Late data.** A site is offline for two days, and then its gateway sends 170 million readings in an hour.

- The **lake** partitions by event date, so the readings go to the correct days.
- The **minute table** is updated by [upsert](/lesson/merge-patterns) on machine and minute, with an allowed lateness of seven days.
- The **alert job** must not send alerts for a temperature of two days ago. Alerts are raised only for windows that are recent. Old windows update the tables and are recorded as “detected late”.
- The burst itself must not block live data from other sites. The key by machine spreads the load, and the consumers are sized for a burst.

**Bad data.** Sensors fail in typical ways: a constant value, zero, an impossible value, a drift. Mark such readings with a quality flag. Do not delete them: a stuck sensor is information for maintenance.

**Silence.** A dead sensor or a gateway with no power sends nothing. No rule on values can see this. A separate check alerts when a machine has sent no reading for five minutes. In IoT systems, an alert on silence is as important as an alert on values.

## Step 7: operations

- **Lag** of each consumer, and the age of the newest reading for each site.
- **Count for each machine for each minute.** It should be near 60.
- **Device management**: a registry of devices and certificates. A reading from a device that is not registered is refused.
- **Cost**: storage classes for old raw data, and retention in the time-series store (minutes for 90 days, hours for years).
- **Test with a replay**: record a day of real readings and send it again at high speed, with a simulated two-day gap.

## The failure questions

| Question | Answer |
|---|---|
| A site loses its connection | The gateway buffers. Data arrives late and goes to the correct time. A silence alert tells the operations room |
| The Flink job stops | It restarts from its checkpoint. Alerts are delayed by the restart time. Lag is monitored |
| A sensor sends an impossible value | Flagged, kept, and excluded from the alert rule |
| The same reading is sent twice after a reconnect | The lake deduplicates by machine, sensor and time. The minute table is an upsert |
| A gateway clock is one hour wrong | Event time and time of receipt differ by an hour for that site. A check on the difference finds it |
| The alert service is down | Alerts queue in a topic and are sent when it returns. The control system of the machine has its own local safety stop, which does not depend on the cloud |

The last row matters. **Safety must not depend on this pipeline.** A cloud analytics system can inform people. The machine must protect itself locally.

## Alternatives, and why they were not chosen

| Alternative | Why not here |
|---|---|
| Write each reading directly into a relational database | 10,000 inserts a second, and no buffer when the database is slow |
| Only the time-series store, with raw data | Possible at a smaller scale. Here ten years of raw data is cheaper in the lake, and the engineers want files |
| Alerts from a batch job each minute | Runs overlap, and late data makes each run wrong. This is what stream processors are for |
| Rules at the gateway only, with no cloud alerting | Good for the fastest safety rules. Rules that compare machines or use history need the central data |

## What to take from this design

- Start with the arithmetic. The volume decides the stores.
- One log, three consumers, three stores, each chosen for one kind of read.
- Devices are offline sometimes. Design for late data from the first day, with event time everywhere.
- Aggregate before you serve. Nobody reads 150 million points.
- Alert on silence as well as on values.
- Keep safety local.

::scenario
? A site reconnects after 30 hours and sends its stored readings. They include ten minutes of high temperature from yesterday.
+ Update the tables for those minutes, record a late-detected event for maintenance to review, and do not page anyone | The data is correct and complete, and the people get the information. An urgent page for a state of yesterday trains them to ignore pages.
- Send the normal high-temperature alert | The on-call person is woken for something that ended 20 hours ago.
~ Drop readings that are more than an hour old | The live path stays simple. The history has a gap of 30 hours, and the high temperature is never seen.
::end
