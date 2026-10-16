# AGENTS.md

## Testing

- Do **not** run the full test suite (`npm test`) for every change. It is slow.
- Run only the test files related to the change, for example:
  `npx vitest run src/features/home/components/OfficersSection.test.jsx`
- Reserve the full suite (`npm test`) for changes that span the whole project, or before a release/merge.
