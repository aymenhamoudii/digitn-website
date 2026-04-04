# Full-Stack Developer Skill

This comprehensive skill combines essential development practices for building high-quality software. Follow these guidelines systematically when building projects.

---

## 1. Brainstorming and Design

### Overview
Help turn ideas into fully formed designs and specs through natural collaborative dialogue. Start by understanding the current project context, then ask questions one at a time to refine the idea.

### Hard Gate
Do NOT write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

### Process Flow
1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Transition to implementation** — create implementation plan

### Key Principles
- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on

### Design for Isolation and Clarity
- Break the system into smaller units that each have one clear purpose
- Each unit should communicate through well-defined interfaces
- Can someone understand what a unit does without reading its internals?
- Smaller, well-bounded units are easier to work with

---

## 2. Implementation Planning

### Overview
Write comprehensive implementation plans assuming the engineer has zero context. Document everything they need to know: which files to touch for each task, code, testing, how to test it. Give them the whole plan as bite-sized tasks.

### File Structure
Before defining tasks, map out which files will be created or modified and what each one is responsible for:
- Design units with clear boundaries and well-defined interfaces
- Each file should have one clear responsibility
- Prefer smaller, focused files over large ones that do too much
- Files that change together should live together

### Bite-Sized Task Granularity
Each step is one action (2-5 minutes):
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

### Task Structure Template
```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

### Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

---

## 3. Test-Driven Development (TDD)

### The Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

### Red-Green-Refactor Cycle

**RED - Write Failing Test**
- Write one minimal test showing what should happen
- One behavior per test
- Clear name describing the behavior
- Real code (no mocks unless unavoidable)

**Verify RED - Watch It Fail**
- MANDATORY. Never skip.
- Confirm test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

**GREEN - Minimal Code**
- Write simplest code to pass the test
- Don't add features, refactor other code, or "improve" beyond the test

**Verify GREEN - Watch It Pass**
- MANDATORY
- Confirm test passes
- Other tests still pass
- Output pristine (no errors, warnings)

**REFACTOR - Clean Up**
- After green only
- Remove duplication
- Improve names
- Extract helpers
- Keep tests green

### Good Test Example
```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```

### Why Order Matters
- Tests written after code pass immediately
- Passing immediately proves nothing
- Test-first forces you to see the test fail
- Proves it actually tests something

### Common Rationalizations to Reject
- "Too simple to test" → Simple code breaks. Test takes 30 seconds.
- "I'll test after" → Tests passing immediately prove nothing.
- "Already manually tested" → Ad-hoc ≠ systematic. No record, can't re-run.
- "Deleting X hours is wasteful" → Sunk cost fallacy. Keeping unverified code is technical debt.

---

## 4. Systematic Debugging

### The Iron Law
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

### The Four Phases

**Phase 1: Root Cause Investigation**

BEFORE attempting ANY fix:

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes

4. **Gather Evidence in Multi-Component Systems**
   - For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
   - Run once to gather evidence showing WHERE it breaks

5. **Trace Data Flow**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

**Phase 2: Pattern Analysis**

1. **Find Working Examples**
   - Locate similar working code in same codebase

2. **Compare Against References**
   - Read reference implementation COMPLETELY
   - Don't skim - read every line

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small

**Phase 3: Hypothesis and Testing**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

**Phase 4: Implementation**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - MUST have before fixing

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze
   - If ≥ 3: STOP and question the architecture

5. **If 3+ Fixes Failed: Question Architecture**
   - Is this pattern fundamentally sound?
   - Should we refactor architecture vs. continue fixing symptoms?
   - Discuss with user before attempting more fixes

### Red Flags - STOP and Follow Process
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

---

## 5. Verification Before Completion

### The Iron Law
```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

### The Gate Function
```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

### Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |

### Red Flags - STOP
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- ANY wording implying success without having run verification

### Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

---

## 6. Code Review Reception

### Core Principle
Verify before implementing. Ask before assuming. Technical correctness over social comfort.

### The Response Pattern
```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

### Forbidden Responses

**NEVER:**
- "You're absolutely right!"
- "Great point!" / "Excellent feedback!"
- "Let me implement that now" (before verification)

**INSTEAD:**
- Restate the technical requirement
- Ask clarifying questions
- Push back with technical reasoning if wrong
- Just start working (actions > words)

### Handling Unclear Feedback
```
IF any item is unclear:
  STOP - do not implement anything yet
  ASK for clarification on unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

### When To Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist

**How to push back:**
- Use technical reasoning, not defensiveness
- Ask specific questions
- Reference working tests/code

### Acknowledging Correct Feedback

When feedback IS correct:
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Thanks for catching that!"
```

---

## 7. Task Execution Best Practices

### Implementation Order
```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

### When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

### Git Workflow
- Create meaningful commit messages
- Commit frequently (after each passing test)
- Never commit without tests passing
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.

---

## 8. Quality Gates

### Before Marking Work Complete

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered
- [ ] Ran verification commands and confirmed output
- [ ] No "should work" or "probably works" - only verified facts

---

## 9. Common Anti-Patterns to Avoid

### Design Phase
- ❌ Skipping design approval for "simple" tasks
- ❌ Not exploring alternatives
- ❌ Adding features not requested (YAGNI violation)

### Implementation Phase
- ❌ Writing code before tests
- ❌ Skipping the "watch it fail" step
- ❌ Over-engineering solutions
- ❌ Fixing multiple things at once

### Debugging Phase
- ❌ Proposing fixes before understanding root cause
- ❌ "Quick fixes" without investigation
- ❌ Trying 3+ fixes without questioning approach

### Completion Phase
- ❌ Claiming success without running verification
- ❌ Performative agreement ("You're right!")
- ❌ Implementing feedback without understanding it

---

## 10. Integration Workflow

### Complete Development Cycle

1. **Brainstorm** → Understand requirements, design solution
2. **Plan** → Break into bite-sized tasks with exact steps
3. **Implement** → TDD for each task (Red-Green-Refactor)
4. **Debug** → Systematic root cause investigation when issues arise
5. **Verify** → Run all verification commands, confirm output
6. **Review** → Receive feedback, verify before implementing
7. **Complete** → All tests pass, all verifications green

### Key Principles Throughout
- **DRY** (Don't Repeat Yourself)
- **YAGNI** (You Aren't Gonna Need It)
- **TDD** (Test-Driven Development)
- **Frequent commits** with meaningful messages
- **Evidence before claims** always

---

## Remember

This is not a checklist to rush through. Each phase exists because skipping it causes bugs, rework, and wasted time. Follow the process systematically, and you'll build high-quality software efficiently.

**The goal is not speed—it's building working software that stays working.**
