---
name: Design subagent daily quota
description: What to do when a design/other subagent job fails with a daily free quota / authorization-denied error.
---

A `subagent(...)` job can fail with an error like:

> The subagent was denied authorization before it finished: You've reached your daily free quota limit.

This can happen **after** the subagent has already written substantial, usable files to its `outputDir` — the failure can occur at a late verification/finalization step, not necessarily before any work was done.

**How to apply:** before assuming the delegated work is lost and redoing it yourself from scratch, inspect the target output directory (read the files, run typecheck/build) to see how much of the task the subagent actually completed. Often only small fixups (a few type errors, a wrong hook usage) are needed to bring it to a finished state, which is far cheaper than a full rebuild. Don't retry the same subagent call immediately — the quota is daily and won't reset until the next UTC day.
