# AGENTS.md

## Testing

- Do **not** run the full test suite (`npm test`) for every change. It is slow.
- Run only the test files related to the change, for example:
  `npx vitest run src/features/home/components/OfficersSection.test.jsx`
- Reserve the full suite (`npm test`) for changes that span the whole project, or before a release/merge.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
