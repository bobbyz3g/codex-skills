# Input Template

Use this template when you want the user to provide cleaner evidence. Accept partial input, but prefer this shape.

```text
Symptom summary:
- What became slow?
- When did it start?
- CPU / memory / IO / connections: anything obviously high?
- Did it start after a release, migration, or traffic spike?

Environment:
- MySQL version:
- CPU:
- RAM:
- Storage type:

SHOW VARIABLES:
<paste output>

SHOW PROCESSLIST:
<paste output>

SHOW ENGINE INNODB STATUS:
<paste output>

Optional slow query log excerpt:
<paste output>

Optional performance_schema summary:
<paste output>
```

## Minimal Follow-Up Policy

If the user did not provide baseline inputs, ask only the most informative missing items.

Recommended order:

1. `SHOW PROCESSLIST` when you need to distinguish slow SQL, waiting threads, and connection saturation.
2. `SHOW ENGINE INNODB STATUS` when you need to confirm lock waits, long transactions, or flush/checkpoint pressure.
3. `SHOW VARIABLES` when you need to interpret capacity and configuration context.
4. Symptom timing or release history when the technical signals are otherwise ambiguous.
