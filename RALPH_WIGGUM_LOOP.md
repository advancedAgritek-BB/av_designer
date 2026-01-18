# The Ralph Wiggum Loop

A methodology for autonomous AI-assisted software development using Claude Code.

## Overview

The Ralph Wiggum Loop is an autonomous development pattern where Claude Code ("Ralph") executes tasks in a continuous loop, with each iteration receiving fresh context and validation feedback. Named affectionately after The Simpsons character, the loop embodies a simple but effective principle: **keep trying with good guidance until the job is done**.

The key insight is that AI assistants work best when given:
1. **Clear, consistent context** on every iteration
2. **Immediate feedback** from validation tools
3. **Focused, single-task instructions**
4. **Automatic recovery** from errors

## Core Principles

### 1. Fresh Context Every Iteration

Context files (ARCHITECTURE.md, CLAUDE.md, AGENTS.md) are injected at the start of every iteration. This ensures Ralph always has accurate information about the codebase, even after Claude's context window condenses or resets.

### 2. One Task at a Time

Each iteration focuses on a single task. This prevents scope creep, makes progress measurable, and ensures each commit represents a complete, working change.

### 3. Validation-Driven Development

The Rust Feedback Loop (format → check → clippy → test) runs after every iteration. Ralph sees the results and can fix issues in the next iteration. Failed validation increments a counter; three consecutive failures stops the loop.

### 4. Autonomous but Bounded

The loop runs autonomously (with `--dangerously-skip-permissions`) but has safety bounds:
- Maximum iteration limits
- Consecutive failure limits
- Rate limit detection and sleep
- Completion signals to stop when done

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH WIGGUM LOOP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Inject    │───▶│  Run Claude │───▶│ Check Completion    │  │
│  │   Context   │    │  with Prompt│    │ Signal              │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
│                                                   │             │
│                                                   ▼             │
│                                        ┌─────────────────────┐  │
│                                        │ Run Validation      │  │
│                                        │ (fmt/check/clippy/  │  │
│                                        │  test)              │  │
│                                        └──────────┬──────────┘  │
│                                                   │             │
│                                                   ▼             │
│                                        ┌─────────────────────┐  │
│                                        │ Push to Remote      │  │
│                                        │ Increment Iteration │  │
│                                        └──────────┬──────────┘  │
│                                                   │             │
│                                                   ▼             │
│                                        ┌─────────────────────┐  │
│                                        │ Check Limits        │──┼──▶ STOP
│                                        │ (max iter, failures)│  │
│                                        └──────────┬──────────┘  │
│                                                   │             │
│                              CONTINUE ◀───────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Iteration Lifecycle

1. **Check Limits**: Verify we haven't hit max iterations or consecutive failures
2. **Pre-Validation** (build mode): Run `cargo check` to give Ralph current state
3. **Inject Context**: Concatenate context files + prompt file
4. **Run Claude**: Pipe the combined input to `claude -p --dangerously-skip-permissions`
5. **Check Rate Limit**: If rate-limited, sleep until reset and retry
6. **Check Completion**: If `<ralph>COMPLETE</ralph>` found, stop
7. **Post-Validation**: Run full feedback loop (fmt, check, clippy, test)
8. **Push Changes**: Push to remote branch
9. **Loop**: Wait 2 seconds, then continue

## Modes

### Build Mode (Default)

```bash
./loop.sh           # Unlimited iterations
./loop.sh 20        # Max 20 iterations
```

Build mode implements tasks from `IMPLEMENTATION_PLAN.md`:
- Pre and post validation enabled
- Stops on `<ralph>COMPLETE</ralph>` signal
- Expects commits after each task

**Prompt**: `PROMPT_build.md`

### Plan Mode

```bash
./loop.sh plan      # Planning mode
./loop.sh plan 5    # Max 5 iterations
```

Plan mode generates/updates implementation plans:
- No validation (planning doesn't need compilation)
- Doesn't check for completion signal
- Outputs to `IMPLEMENTATION_PLAN.md`

**Prompt**: `PROMPT_plan.md`

### Research Mode

```bash
./loop.sh research              # General research
./loop.sh research 10           # Max 10 iterations
./loop.sh research-purearb-v3   # Specific research task
```

Research mode investigates questions and analyzes data:
- No validation
- No completion signal checking
- Runs until max iterations or manual stop

**Prompts**: `PROMPT_research.md`, `PROMPT_research_*.md`

## File Structure

```
project/
├── loop.sh                  # Main loop script
├── scripts/
│   └── check.sh             # Validation script (standalone)
├── ARCHITECTURE.md          # System design (context file)
├── CLAUDE.md                # AI development rules (context file)
├── AGENTS.md                # Technical patterns (context file)
├── IMPLEMENTATION_PLAN.md   # Task list for build mode
├── PROMPT_build.md          # Build mode instructions
├── PROMPT_plan.md           # Plan mode instructions
├── PROMPT_research.md       # Research mode instructions
└── PROMPT_*.md              # Custom mode prompts
```

## Context Files

These files are injected at the start of every iteration:

### ARCHITECTURE.md
System design documentation:
- Component diagram
- Data flow
- Key interfaces
- Critical code locations

### CLAUDE.md
Development rules for Ralph:
- Code quality standards
- Validation requirements
- Forbidden actions
- Recovery procedures

### AGENTS.md
Technical reference:
- Build commands
- Project structure
- Codebase patterns
- Common gotchas

## Validation Feedback Loops

Based on Matt Pocock's "5 Feedback Loops" for TypeScript, adapted for Rust:

| Loop | Tool | Purpose |
|------|------|---------|
| 1. Format | `cargo fmt --check` | Code formatting consistency |
| 2. Type Check | `cargo check --all-targets` | Compilation errors |
| 3. Lint | `cargo clippy --all-targets` | Code quality warnings |
| 4. Test | `cargo test --all` | Behavior verification |
| 5. Pre-commit | `.githooks/pre-commit` | Final gate before commit |

### Validation Script

The `scripts/check.sh` script runs all checks:

```bash
./scripts/check.sh           # Full check
./scripts/check.sh --quick   # Format + check only
./scripts/check.sh --full    # Strict (warnings = errors)
./scripts/check.sh --fix     # Auto-fix formatting
```

## Setting Up the Loop

### 1. Create Context Files

```bash
# ARCHITECTURE.md - document your system design
# CLAUDE.md - write development rules
# AGENTS.md - document patterns and commands
```

### 2. Create the Loop Script

Copy `loop.sh` to your project and customize:
- `CONTEXT_FILES` array
- Mode definitions
- Validation commands (adapt for your language)

### 3. Create Prompt Files

Each mode needs a prompt file. Key elements:

```markdown
# Mode Name

## Context Files (Injected Automatically)
Remind Ralph what context files exist.

## Instructions
Step-by-step task instructions.

## Rules
Constraints and guardrails.

## Completion Signal (for build mode)
<ralph>COMPLETE</ralph>
```

### 4. Set Up Git Hooks

```bash
mkdir -p .githooks
cat > .githooks/pre-commit << 'EOF'
#!/bin/bash
./scripts/check.sh --quick
EOF
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

### 5. Run the Loop

```bash
./loop.sh           # Start building
./loop.sh plan      # Or start planning
```

## Creating New Modes

To add a new mode (e.g., `refactor`):

1. **Create the prompt file**: `PROMPT_refactor.md`

2. **Add the mode to loop.sh**:
```bash
refactor)
    MODE="refactor"
    PROMPT_FILE="PROMPT_refactor.md"
    VALIDATE_BEFORE=true
    VALIDATE_AFTER=true
    CHECK_COMPLETE=true
    shift
    ;;
```

3. **Run it**:
```bash
./loop.sh refactor
./loop.sh refactor 10  # With iteration limit
```

## Safety Features

### Consecutive Failure Limit

After 3 consecutive validation failures, the loop stops. This prevents infinite loops when Ralph is stuck.

```bash
MAX_CONSECUTIVE_FAILURES=3
```

### Rate Limit Detection

The loop detects Anthropic API rate limits and automatically sleeps until the reset time:

```bash
# In the log: "rate limit resets 3pm"
>>> RATE LIMIT DETECTED <<<
>>> Sleeping for 45 minutes until rate limit resets...
```

### Maximum Iterations

Always set a reasonable iteration limit for unattended runs:

```bash
./loop.sh 50  # Stop after 50 iterations regardless
```

### Completion Signal

Build mode stops when Ralph outputs `<ralph>COMPLETE</ralph>`, indicating all tasks are done.

## Best Practices

### 1. Keep Context Files Updated

Stale context files lead to poor decisions. Update them when:
- Architecture changes
- New patterns are established
- Common mistakes are discovered

### 2. Write Focused Prompts

Each prompt should give Ralph a clear, achievable goal. Avoid vague instructions like "improve the code" — be specific: "Implement the XrpWindowTracker with these exact thresholds..."

### 3. Use Implementation Plans

For build mode, maintain a clear task list in `IMPLEMENTATION_PLAN.md`:

```markdown
## High Priority
- [ ] Implement entry signal detection (arb-strategy)
- [ ] Add position tracking (arb-state)

## Completed
- [x] Set up project structure (iteration 1)
```

### 4. Monitor the Loop

Watch the output or check logs (`.ralph_iteration_N.log`) periodically. Look for:
- Repeated failures on the same task
- Validation errors that aren't being fixed
- Tasks being skipped

### 5. Use Appropriate Modes

- **Build**: When you have a clear task list
- **Plan**: When you need to break down requirements
- **Research**: When investigating unknowns

### 6. Set Up Pre-Commit Hooks

Pre-commit hooks are the final safety net. They ensure nothing gets committed that doesn't pass validation, even if the loop script has a bug.

## Troubleshooting

### Loop Keeps Failing

1. Check the log files: `.ralph_iteration_N.log`
2. Run validation manually: `./scripts/check.sh`
3. Look for recurring errors
4. Consider simplifying the current task

### Rate Limited

The loop handles this automatically, but if you're hitting limits frequently:
- Reduce iteration frequency (increase sleep time)
- Use a model with higher limits
- Run during off-peak hours

### Context Too Long

If context files get too large:
- Move detailed docs to separate files
- Keep context files focused on essentials
- Use links to detailed documentation

### Ralph Ignoring Instructions

If Ralph isn't following the prompt:
- Make instructions more explicit
- Add examples
- Add the rule to CLAUDE.md as a "Forbidden Action"

## Example Session

```bash
$ ./loop.sh 10
================================================
  RALPH WIGGUM - Autonomous Loop
  Now with Rust Feedback Loops!
================================================
Mode:       build
Branch:     feature/tsunami-v2
Max Iters:  10
Prompt:     PROMPT_build.md
Validate:   before=true after=true
Auto-stop:  true
================================================

=== Iteration 1 14:32:15 ===
>>> Rust Feedback Loop (before iteration)...
  [1/4] Format check...
  ✓ Format OK
  [2/4] Type check (cargo check)...
  ✓ Type check OK
  [3/4] Clippy...
  ✓ Clippy OK
  [4/4] Tests (skipped before iteration)

[Claude output...]
[Commits changes]

>>> Post-iteration Rust Feedback Loop...
  ✓ All checks passed!
>>> Validation PASSED - resetting failure counter

=== Iteration 2 14:35:42 ===
...

================================================
  COMPLETE signal received!
  All tasks finished after 7 iterations.
================================================
```
