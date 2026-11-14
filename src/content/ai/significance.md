---
minutes: 8
tech: []
refs:
  - islp: Ch. 13, “Multiple Testing”, Sections 13.1 and 13.3
---
A new model scores 1 point higher. A change to a website raises clicks by 2%. Is that real, or luck? **Significance tests** and **confidence intervals** are tools to answer this honestly. They are easy to misread, and the ways of fooling yourself are common enough to learn by name.

## Confidence intervals

A **95% confidence interval** is a range computed from a sample, by a method that, over many repeated samples, contains the true value 95% of the time.

From [Samples and estimates](/lesson/samples): accuracy 90% on 1,000 examples, standard error about 0.95 points, gives a 95% interval of roughly 90 ± 1.9, so 88.1% to 91.9%.

Report intervals, not single numbers. "90% (88–92)" says much more than "90%".

## Significance and p-values

A **significance test** starts from the boring explanation, the **null hypothesis**: "there is no real difference; it is chance". The **p-value** is the probability of seeing a result at least as extreme as yours, *if* the null hypothesis were true.

- A small p-value, by convention under 0.05, means the result would be surprising if it were only chance.
- It does **not** mean "95% chance the effect is real". And a large p-value does not prove there is no effect; maybe the test was too small.

## Effect size matters more

With enough data, tiny effects become "significant". A 0.1% improvement measured on 10 million users can have a tiny p-value and still not be worth anything. Always ask how big the effect is, with its interval, and whether that size matters.

## Ways to fool yourself

- **Many tries.** Test 20 variants against a 0.05 threshold, and on average one will look significant by pure chance. Correct for the number of tests, or confirm on fresh data.
- **Peeking.** Checking an A/B test every day and stopping when it looks good inflates false positives.
- **Tuning on the test set.** Each time you adjust a model after looking at test results, the test set becomes part of training, and its score becomes optimistic. This is why a final test set is touched once, as the lesson on train, validation and test explains.
- **Benchmark luck.** Many published improvements shrink or vanish when rerun with other random seeds. Run several seeds and report the spread.

> **Rule of thumb.** Decide the test, the measure and the sample size before you look at results. Then look once.

## Remember

- A confidence interval gives a range of plausible values. Report it.
- A p-value is the chance of a result this extreme if there were no real effect. It is not the chance that the effect is real.
- Effect size matters more than significance.
- Many tries, peeking and tuning on the test set all make chance look real.

::quiz
? A team tests 40 prompt variants and finds 2 that beat the baseline at p < 0.05. What should they do?
+ Treat them as candidates and confirm on fresh data, because about 2 would pass by chance alone
- Ship both
- Conclude that prompts do not matter
! With 40 tests at 0.05, about 2 false positives are expected. Confirm before you trust them.
? What does a p-value of 0.03 mean?
+ If there were no real effect, a result at least this extreme would happen about 3% of the time
- There is a 97% chance the effect is real
- The effect is 3% in size
! The p-value is computed assuming no effect. It is not the probability that the effect is real.
::end
