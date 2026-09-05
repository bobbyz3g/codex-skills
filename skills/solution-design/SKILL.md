---
name: solution-design
description: "Develop practical technical designs for new features, architecture changes, or complex fixes with meaningful implementation tradeoffs. Use for solution planning and design comparisons; skip routine edits, pure debugging, and visual styling."
---

# Solution Design

Resolve the decisions that determine whether an approach will meet the user's goal. Apply the principles below only where they affect the design; scale investigation and output to the decision's consequence and uncertainty.

Respect the requested mode of work. A planning-only request remains read-only. When implementation is already authorized, carry useful design decisions into implementation and verification without introducing a separate plan-approval gate. Ask only about consequential decisions that cannot reasonably be resolved from context, and continue independent authorized work while awaiting an answer.

## Establish the Goal and Current State

Identify the problem, observable success criteria, and actual constraints. Inspect the relevant code, live configuration, and prior decisions before making repository-specific claims. Separate verified constraints from preferences and assumptions. Reuse context the user has already supplied; do not turn this into a mandatory interview or require repository evidence for a greenfield concept.

## Check Existing Capabilities

Check relevant project abstractions, framework features, and official approaches before proposing custom machinery. Use sources matching the project's version when external behavior matters. Prefer reuse when it fits the goal and keeps the design understandable; explain a concrete mismatch when choosing a custom approach. Stop searching when further discovery is unlikely to change the choice.

## Recommend a Proportionate Approach

Recommend the simplest coherent approach that fully satisfies the goal. Explain the tradeoffs that could change the user's decision, such as implementation effort, operational cost, compatibility, and future evolution. Discuss alternatives only when those tradeoffs materially differ. Honor an explicit redesign or compatibility break rather than assuming the smallest diff is always the goal.

## Test the Load-Bearing Assumption

Identify the uncertain premise most likely to invalidate the recommendation and explain the consequence if it fails. Prefer the smallest informative check before substantial implementation, such as inspecting a call path, verifying an API contract, or running an authorized isolated experiment. If verification is unavailable or disproportionately costly, state the uncertainty and adapt the design or identify the decision it leaves open. Do not invent a fragile assumption when the evidence already settles it.

## Examine Relevant Failure Cases

Investigate failure behavior where the design introduces a concrete exposure. For external services, consider outages and recovery; for shared state, consider ordering and consistency; for data migrations, consider reversibility and partial failure. Base scale assumptions on plausible workloads and known limits. Change the approach when a credible failure would defeat the goal; omit generic resilience checklists for unaffected work.

## Make the Design Implementable and Verifiable

Make direction-setting decisions explicit: relevant interfaces, data flow, affected boundaries, and observable acceptance criteria. Include verification methods and rollout or recovery steps when they matter. Leave routine coding details to implementation and label unresolved decisions that could change the approach. Create a detailed handoff only when requested or necessary for another executor; do not force every design into a fixed document template or create a plan file unless the task calls for one.
