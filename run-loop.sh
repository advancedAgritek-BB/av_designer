#!/bin/bash

# ============================================================================
# RALPH WIGGUM LOOP - Watchdog Wrapper
# ============================================================================
# This wrapper ensures the loop keeps running even if it crashes.
# It will automatically restart the loop after a brief delay.
# ============================================================================

# Configuration
RESTART_DELAY=30
MAX_RESTARTS=100  # Set to 0 for unlimited

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Pass through arguments to loop.sh
LOOP_ARGS="$@"

# Track restarts
RESTART_COUNT=0

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  RALPH WIGGUM - Watchdog Wrapper${NC}"
echo -e "${CYAN}================================================${NC}"
echo -e "Loop args:    ${YELLOW}${LOOP_ARGS:-"(none)"}${NC}"
echo -e "Max restarts: ${YELLOW}${MAX_RESTARTS:-"unlimited"}${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

while true; do
    # Check max restarts
    if [[ $MAX_RESTARTS -gt 0 ]] && [[ $RESTART_COUNT -ge $MAX_RESTARTS ]]; then
        echo -e "${RED}================================================${NC}"
        echo -e "${RED}  Max restarts ($MAX_RESTARTS) reached${NC}"
        echo -e "${RED}  Stopping watchdog.${NC}"
        echo -e "${RED}================================================${NC}"
        exit 1
    fi

    if [[ $RESTART_COUNT -gt 0 ]]; then
        echo -e "${YELLOW}================================================${NC}"
        echo -e "${YELLOW}  Restarting loop (attempt $RESTART_COUNT)...${NC}"
        echo -e "${YELLOW}================================================${NC}"
    fi

    # Run the main loop
    ./loop.sh $LOOP_ARGS
    EXIT_CODE=$?

    # Check exit code
    if [[ $EXIT_CODE -eq 0 ]]; then
        echo -e "${GREEN}================================================${NC}"
        echo -e "${GREEN}  Loop completed successfully!${NC}"
        echo -e "${GREEN}================================================${NC}"
        exit 0
    fi

    RESTART_COUNT=$((RESTART_COUNT + 1))

    echo -e "${YELLOW}================================================${NC}"
    echo -e "${YELLOW}  Loop exited with code $EXIT_CODE${NC}"
    echo -e "${YELLOW}  Restarting in ${RESTART_DELAY}s...${NC}"
    echo -e "${YELLOW}  (Press Ctrl+C to stop)${NC}"
    echo -e "${YELLOW}================================================${NC}"

    sleep $RESTART_DELAY
done
