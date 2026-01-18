#!/bin/bash

# ============================================================================
# AV Designer - Validation Script
# ============================================================================
# TypeScript/React/Tauri feedback loop based on Matt Pocock's 5 Feedback Loops
# Adapted for the AV Designer tech stack.
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
QUICK=false
FULL=false
FIX=false

for arg in "$@"; do
    case $arg in
        --quick)
            QUICK=true
            ;;
        --full)
            FULL=true
            ;;
        --fix)
            FIX=true
            ;;
    esac
done

# Track overall status
FAILED=false

# Helper function
run_check() {
    local name=$1
    local cmd=$2
    echo -e "${BLUE}  [$name]${NC} Running..."

    if eval "$cmd" > /tmp/check_output.txt 2>&1; then
        echo -e "${GREEN}  ✓ $name OK${NC}"
        return 0
    else
        echo -e "${RED}  ✗ $name FAILED${NC}"
        cat /tmp/check_output.txt
        return 1
    fi
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  AV Designer - Validation${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if we're in a project with package.json
if [[ ! -f "package.json" ]]; then
    echo -e "${YELLOW}  ⚠ No package.json found - skipping npm checks${NC}"

    # Check Rust if Cargo.toml exists
    if [[ -f "src-tauri/Cargo.toml" ]]; then
        echo -e "${BLUE}[1/2] Rust format check...${NC}"
        if command -v cargo &> /dev/null; then
            cd src-tauri
            if [[ "$FIX" == "true" ]]; then
                cargo fmt || FAILED=true
            else
                cargo fmt --check || FAILED=true
            fi

            echo -e "${BLUE}[2/2] Rust clippy...${NC}"
            cargo clippy --all-targets -- -D warnings || FAILED=true
            cd ..
        fi
    fi

    if [[ "$FAILED" == "true" ]]; then
        exit 1
    fi
    exit 0
fi

# ============================================================================
# Feedback Loop 1: Format Check (Prettier)
# ============================================================================
echo -e "${BLUE}[1/5] Format check (Prettier)...${NC}"

if command -v npx &> /dev/null && [[ -f ".prettierrc" ]] || [[ -f "prettier.config.js" ]] || [[ -f ".prettierrc.json" ]]; then
    if [[ "$FIX" == "true" ]]; then
        npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,json}" 2>/dev/null || true
        echo -e "${GREEN}  ✓ Format applied${NC}"
    else
        if npx prettier --check "src/**/*.{ts,tsx,js,jsx,css,json}" 2>/dev/null; then
            echo -e "${GREEN}  ✓ Format OK${NC}"
        else
            echo -e "${YELLOW}  ⚠ Format issues found (run with --fix to auto-fix)${NC}"
            # Don't fail on format issues in quick mode
            if [[ "$FULL" == "true" ]]; then
                FAILED=true
            fi
        fi
    fi
else
    echo -e "${YELLOW}  ⚠ Prettier not configured - skipping${NC}"
fi

# ============================================================================
# Feedback Loop 2: Type Check (TypeScript)
# ============================================================================
echo -e "${BLUE}[2/5] Type check (TypeScript)...${NC}"

if [[ -f "tsconfig.json" ]]; then
    if npx tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}  ✓ Type check OK${NC}"
    else
        echo -e "${RED}  ✗ Type errors found${NC}"
        npx tsc --noEmit 2>&1 | head -50
        FAILED=true
    fi
else
    echo -e "${YELLOW}  ⚠ No tsconfig.json - skipping TypeScript check${NC}"
fi

# Quick mode stops here
if [[ "$QUICK" == "true" ]]; then
    echo -e "${BLUE}================================================${NC}"
    if [[ "$FAILED" == "true" ]]; then
        echo -e "${RED}  Quick check FAILED${NC}"
        exit 1
    else
        echo -e "${GREEN}  Quick check PASSED${NC}"
        exit 0
    fi
fi

# ============================================================================
# Feedback Loop 3: Lint (ESLint)
# ============================================================================
echo -e "${BLUE}[3/5] Lint check (ESLint)...${NC}"

if [[ -f ".eslintrc.js" ]] || [[ -f ".eslintrc.json" ]] || [[ -f "eslint.config.js" ]] || [[ -f ".eslintrc.cjs" ]]; then
    if [[ "$FIX" == "true" ]]; then
        npx eslint . --fix 2>/dev/null || true
        echo -e "${GREEN}  ✓ Lint fixes applied${NC}"
    else
        if npx eslint . 2>/dev/null; then
            echo -e "${GREEN}  ✓ Lint OK${NC}"
        else
            echo -e "${RED}  ✗ Lint errors found${NC}"
            FAILED=true
        fi
    fi
else
    # Check if npm script exists
    if grep -q '"lint"' package.json 2>/dev/null; then
        if npm run lint 2>/dev/null; then
            echo -e "${GREEN}  ✓ Lint OK${NC}"
        else
            echo -e "${RED}  ✗ Lint errors found${NC}"
            FAILED=true
        fi
    else
        echo -e "${YELLOW}  ⚠ ESLint not configured - skipping${NC}"
    fi
fi

# ============================================================================
# Feedback Loop 4: Tests (Vitest/Jest)
# ============================================================================
echo -e "${BLUE}[4/5] Tests...${NC}"

if grep -q '"test:run"' package.json 2>/dev/null; then
    if npm run test:run 2>/dev/null; then
        echo -e "${GREEN}  ✓ Tests OK${NC}"
    else
        echo -e "${RED}  ✗ Tests failed${NC}"
        FAILED=true
    fi
elif grep -q '"test"' package.json 2>/dev/null; then
    if npm run test:run 2>/dev/null || npm test -- --run 2>/dev/null; then
        echo -e "${GREEN}  ✓ Tests OK${NC}"
    else
        echo -e "${RED}  ✗ Tests failed${NC}"
        FAILED=true
    fi
else
    echo -e "${YELLOW}  ⚠ No test script configured - skipping${NC}"
fi

# ============================================================================
# Feedback Loop 5: Rust Backend (Tauri)
# ============================================================================
echo -e "${BLUE}[5/5] Rust backend (Tauri)...${NC}"

if [[ -d "src-tauri" ]] && [[ -f "src-tauri/Cargo.toml" ]]; then
    cd src-tauri

    # Format check
    if command -v cargo &> /dev/null; then
        echo -e "${BLUE}  [5a] Rust format...${NC}"
        if [[ "$FIX" == "true" ]]; then
            cargo fmt 2>/dev/null || true
        else
            if cargo fmt --check 2>/dev/null; then
                echo -e "${GREEN}    ✓ Rust format OK${NC}"
            else
                echo -e "${YELLOW}    ⚠ Rust format issues${NC}"
                if [[ "$FULL" == "true" ]]; then
                    FAILED=true
                fi
            fi
        fi

        # Type check
        echo -e "${BLUE}  [5b] Rust check...${NC}"
        if cargo check --all-targets 2>/dev/null; then
            echo -e "${GREEN}    ✓ Rust check OK${NC}"
        else
            echo -e "${RED}    ✗ Rust check failed${NC}"
            FAILED=true
        fi

        # Clippy (full mode only)
        if [[ "$FULL" == "true" ]]; then
            echo -e "${BLUE}  [5c] Rust clippy...${NC}"
            if cargo clippy --all-targets -- -D warnings 2>/dev/null; then
                echo -e "${GREEN}    ✓ Clippy OK${NC}"
            else
                echo -e "${RED}    ✗ Clippy warnings${NC}"
                FAILED=true
            fi
        fi
    else
        echo -e "${YELLOW}  ⚠ Cargo not found - skipping Rust checks${NC}"
    fi

    cd ..
else
    echo -e "${YELLOW}  ⚠ No Tauri backend found - skipping${NC}"
fi

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}================================================${NC}"

if [[ "$FAILED" == "true" ]]; then
    echo -e "${RED}  Validation FAILED${NC}"
    echo -e "${BLUE}================================================${NC}"
    exit 1
else
    echo -e "${GREEN}  Validation PASSED${NC}"
    echo -e "${BLUE}================================================${NC}"
    exit 0
fi
