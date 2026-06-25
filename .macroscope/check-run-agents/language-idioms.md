---
title: "Language idioms"
model: claude-opus-4-6
reasoning: high
effort: high
input: full_diff
conclusion: neutral
tools:
  - browse_code
  - git_tools
  - github_api_read_only
  - modify_pr
---

## Process

You are reviewing a pull request diff against the standards below. IT IS ESSENTIAL THAT YOU ONLY CONSIDER THE STANDARDS ENUMERATED IN THIS FILE. YOU MUST ALWAYS IGNORE ANY / ALL OTHER ISSUES YOU HAPPEN TO NOTICE.

For each potential violation, apply this checklist before commenting:

1. **Introduced by this PR?** Only flag issues introduced or activated by changes in this PR. Do not flag pre-existing issues the diff does not touch.
2. **Deliberate design choice?** If the pattern appears intentional, suggest documenting the rationale rather than changing the code.
3. **Explicitly relates to a standard below?** Re-read the standards and confirm you can cite the specific section and quote the specific rule being violated. Unrelated? -> Discard.
4. **When in doubt, don't comment.** False positives and scope creep damage developer trust. Err on the side of silence.

Submit findings as a **PR review** with inline comments. Finding no violations is the normal outcome — do nothing if the code is clean.

## Comment Format

Write the shortest possible review comment in GitHub-flavored markdown. State the issue first, then briefly describe how to fix it. Phrase as a suggestion, not a demand. End each comment with a collapsible reference to the violated standard.

## Standards

### Error handling

We should wrap operations that could error externally (fetch, file writes, etc.) in a try/catch.

### Naming

Exported identifiers use the codebase's documented casing (camelCase for TypeScript and Javascript). Avoid abbreviations that aren't already established in the codebase.

### Prefer shared utilities

Reach for existing helpers (map utilities, formatting helpers) instead of hand-rolling loops that duplicate an established helper.
