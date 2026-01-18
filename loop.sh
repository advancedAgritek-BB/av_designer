#!/bin/bash

# ============================================================================
# RALPH WIGGUM LOOP - Autonomous AI-Assisted Development
# ============================================================================
# A methodology for autonomous AI-assisted software development using Claude Code.
# Named affectionately after The Simpsons character, the loop embodies a simple
# but effective principle: keep trying with good guidance until the job is done.
# ============================================================================

set -e

# Configuration
CONTEXT_FILES=("ARCHITECTURE.md" "CLAUDE.md" "AGENTS.md")
MAX_CONSECUTIVE_FAILURES=3
MAX_CLAUDE_RETRIES=3
SLEEP_BETWEEN_ITERATIONS=2
RETRY_BACKOFF_BASE=30
LOG_PREFIX=".ralph_iteration"
AUTO_RESTART=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
MODE="build"
PROMPT_FILE="PROMPT_build.md"
VALIDATE_BEFORE=true
VALIDATE_AFTER=true
CHECK_COMPLETE=true
MAX_ITERATIONS=0  # 0 = unlimited

# Mode selection (only process if we have arguments)
if [[ $# -gt 0 ]]; then
    case "$1" in
        plan)
            MODE="plan"
            PROMPT_FILE="PROMPT_plan.md"
            VALIDATE_BEFORE=false
            VALIDATE_AFTER=false
            CHECK_COMPLETE=false
            shift
            ;;
        research)
            MODE="research"
            PROMPT_FILE="PROMPT_research.md"
            VALIDATE_BEFORE=false
            VALIDATE_AFTER=false
            CHECK_COMPLETE=false
            shift
            ;;
        research-*)
            MODE="$1"
            PROMPT_FILE="PROMPT_${1}.md"
            VALIDATE_BEFORE=false
            VALIDATE_AFTER=false
            CHECK_COMPLETE=false
            shift
            ;;
        build)
            shift
            ;;
        [0-9]*)
            # First arg is a number, use as max iterations
            MAX_ITERATIONS=$1
            shift
            ;;
        *)
            # Custom mode
            if [[ -f "PROMPT_${1}.md" ]]; then
                MODE="$1"
                PROMPT_FILE="PROMPT_${1}.md"
                shift
            fi
            ;;
    esac
fi

# Check for max iterations argument
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
    MAX_ITERATIONS=$1
    shift
fi

# Get current git branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Print header
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  RALPH WIGGUM - Autonomous Loop${NC}"
echo -e "${CYAN}  AV Designer Edition${NC}"
echo -e "${CYAN}================================================${NC}"
echo -e "Mode:       ${YELLOW}${MODE}${NC}"
echo -e "Branch:     ${YELLOW}${BRANCH}${NC}"
echo -e "Max Iters:  ${YELLOW}${MAX_ITERATIONS:-unlimited}${NC}"
echo -e "Prompt:     ${YELLOW}${PROMPT_FILE}${NC}"
echo -e "Validate:   before=${VALIDATE_BEFORE} after=${VALIDATE_AFTER}"
echo -e "Auto-stop:  ${CHECK_COMPLETE}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Validate required files exist
for file in "${CONTEXT_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}ERROR: Required context file missing: $file${NC}"
        exit 1
    fi
done

if [[ ! -f "$PROMPT_FILE" ]]; then
    echo -e "${RED}ERROR: Prompt file missing: $PROMPT_FILE${NC}"
    exit 1
fi

# Initialize counters
ITERATION=0
CONSECUTIVE_FAILURES=0

# Function to run validation
run_validation() {
    local phase=$1
    echo -e "${BLUE}>>> TypeScript/React Feedback Loop ($phase)...${NC}"

    if [[ -f "scripts/check.sh" ]]; then
        if ./scripts/check.sh; then
            echo -e "${GREEN}  ✓ All checks passed!${NC}"
            return 0
        else
            echo -e "${RED}  ✗ Validation failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}  ⚠ No validation script found (scripts/check.sh)${NC}"
        return 0
    fi
}

# Function to check for rate limit
check_rate_limit() {
    local output=$1
    if echo "$output" | grep -qi "rate limit"; then
        # Extract reset time if present
        local reset_time=$(echo "$output" | grep -oP 'resets? (at )?\K[0-9:apm]+' | head -1)
        echo -e "${YELLOW}>>> RATE LIMIT DETECTED <<<${NC}"
        if [[ -n "$reset_time" ]]; then
            echo -e "${YELLOW}>>> Rate limit resets at: $reset_time${NC}"
        fi
        echo -e "${YELLOW}>>> Sleeping for 30 minutes...${NC}"
        sleep 1800
        return 0  # Retry
    fi
    return 1  # No rate limit
}

# Function to check for Claude errors (transient failures)
check_claude_error() {
    local output=$1
    local exit_code=$2

    # Check for known transient errors
    if echo "$output" | grep -qi "No messages returned"; then
        echo -e "${YELLOW}>>> Claude returned no messages (transient error)${NC}"
        return 0  # Is an error
    fi

    if echo "$output" | grep -qi "ECONNRESET\|ETIMEDOUT\|ENOTFOUND"; then
        echo -e "${YELLOW}>>> Network error detected${NC}"
        return 0  # Is an error
    fi

    if echo "$output" | grep -qi "500\|502\|503\|504"; then
        echo -e "${YELLOW}>>> Server error detected${NC}"
        return 0  # Is an error
    fi

    if [[ $exit_code -ne 0 ]] && [[ -z "$output" ]]; then
        echo -e "${YELLOW}>>> Claude exited with code $exit_code and no output${NC}"
        return 0  # Is an error
    fi

    return 1  # No error
}

# Function to run Claude with retries
run_claude_with_retry() {
    local context=$1
    local log_file=$2
    local retry_count=0
    local output=""
    local exit_code=0

    while [[ $retry_count -lt $MAX_CLAUDE_RETRIES ]]; do
        echo -e "${BLUE}>>> Running Claude (attempt $((retry_count + 1))/$MAX_CLAUDE_RETRIES)...${NC}"

        set +e
        output=$(echo "$context" | claude -p --dangerously-skip-permissions 2>&1 | tee "$log_file")
        exit_code=$?
        set -e

        # Check for rate limit first
        if check_rate_limit "$output"; then
            # Rate limit handled, retry immediately
            continue
        fi

        # Check for transient errors
        if check_claude_error "$output" "$exit_code"; then
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $MAX_CLAUDE_RETRIES ]]; then
                local backoff=$((RETRY_BACKOFF_BASE * retry_count))
                echo -e "${YELLOW}>>> Retrying in ${backoff}s...${NC}"
                sleep $backoff
                continue
            else
                echo -e "${RED}>>> Max retries ($MAX_CLAUDE_RETRIES) exceeded${NC}"
                CLAUDE_OUTPUT=""
                CLAUDE_EXIT_CODE=1
                return 1
            fi
        fi

        # Success
        CLAUDE_OUTPUT="$output"
        CLAUDE_EXIT_CODE=$exit_code
        return 0
    done

    CLAUDE_OUTPUT=""
    CLAUDE_EXIT_CODE=1
    return 1
}

# Function to check for completion signal
check_completion() {
    local output=$1
    if echo "$output" | grep -q "<ralph>COMPLETE</ralph>"; then
        return 0  # Complete
    fi
    return 1  # Not complete
}

# Function to build context
build_context() {
    local context=""

    # Add context files
    for file in "${CONTEXT_FILES[@]}"; do
        context+="
=== $file ===
$(cat "$file")

"
    done

    # Add implementation plan if in build mode
    if [[ "$MODE" == "build" ]] && [[ -f "IMPLEMENTATION_PLAN.md" ]]; then
        context+="
=== IMPLEMENTATION_PLAN.md ===
$(cat "IMPLEMENTATION_PLAN.md")

"
    fi

    # Add prompt file
    context+="
=== PROMPT ($PROMPT_FILE) ===
$(cat "$PROMPT_FILE")
"

    echo "$context"
}

# Main loop
while true; do
    ITERATION=$((ITERATION + 1))

    # Check max iterations
    if [[ $MAX_ITERATIONS -gt 0 ]] && [[ $ITERATION -gt $MAX_ITERATIONS ]]; then
        echo -e "${YELLOW}================================================${NC}"
        echo -e "${YELLOW}  Maximum iterations ($MAX_ITERATIONS) reached${NC}"
        echo -e "${YELLOW}================================================${NC}"
        exit 0
    fi

    # Check consecutive failures
    if [[ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]]; then
        echo -e "${RED}================================================${NC}"
        echo -e "${RED}  Too many consecutive failures ($CONSECUTIVE_FAILURES)${NC}"
        if [[ "$AUTO_RESTART" == "true" ]]; then
            echo -e "${YELLOW}  Auto-restart enabled - resetting and continuing...${NC}"
            echo -e "${RED}================================================${NC}"
            CONSECUTIVE_FAILURES=0
            echo -e "${YELLOW}>>> Sleeping 60s before restart...${NC}"
            sleep 60
            continue
        else
            echo -e "${RED}  Stopping loop.${NC}"
            echo -e "${RED}================================================${NC}"
            exit 1
        fi
    fi

    echo -e "${CYAN}=== Iteration $ITERATION $(date +%H:%M:%S) ===${NC}"

    # Pre-validation (build mode only)
    if [[ "$VALIDATE_BEFORE" == "true" ]]; then
        if ! run_validation "before iteration"; then
            echo -e "${YELLOW}>>> Pre-validation found issues - Claude will see these${NC}"
        fi
    fi

    # Build context and run Claude
    CONTEXT=$(build_context)
    LOG_FILE="${LOG_PREFIX}_${ITERATION}.log"

    # Run Claude with automatic retry on transient failures
    if ! run_claude_with_retry "$CONTEXT" "$LOG_FILE"; then
        echo -e "${RED}>>> Claude failed after all retries${NC}"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        echo -e "${YELLOW}>>> Consecutive failures: $CONSECUTIVE_FAILURES${NC}"
        sleep $SLEEP_BETWEEN_ITERATIONS
        continue
    fi

    OUTPUT="$CLAUDE_OUTPUT"

    # Check for completion signal
    if [[ "$CHECK_COMPLETE" == "true" ]] && check_completion "$OUTPUT"; then
        echo -e "${GREEN}================================================${NC}"
        echo -e "${GREEN}  COMPLETE signal received!${NC}"
        echo -e "${GREEN}  All tasks finished after $ITERATION iterations.${NC}"
        echo -e "${GREEN}================================================${NC}"
        exit 0
    fi

    # Post-validation
    if [[ "$VALIDATE_AFTER" == "true" ]]; then
        echo -e "${BLUE}>>> Post-iteration validation...${NC}"
        if run_validation "after iteration"; then
            echo -e "${GREEN}>>> Validation PASSED - resetting failure counter${NC}"
            CONSECUTIVE_FAILURES=0
        else
            CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
            echo -e "${YELLOW}>>> Validation FAILED - consecutive failures: $CONSECUTIVE_FAILURES${NC}"
        fi
    fi

    # Push changes (if there are any)
    if git diff --quiet && git diff --staged --quiet; then
        echo -e "${YELLOW}>>> No changes to push${NC}"
    else
        echo -e "${BLUE}>>> Pushing changes...${NC}"
        git push origin "$BRANCH" 2>/dev/null || echo -e "${YELLOW}>>> Push failed or no remote${NC}"
    fi

    # Sleep before next iteration
    echo -e "${BLUE}>>> Sleeping ${SLEEP_BETWEEN_ITERATIONS}s before next iteration...${NC}"
    sleep $SLEEP_BETWEEN_ITERATIONS
    echo ""
done
