# Budget Tracker

## Regression tests

From the `frontend` directory, run:

```sh
npm ci              # Install the locked dependencies on a fresh checkout
npm test            # Run all tests once
npm run test:watch  # Re-run tests while editing
npm run check       # Tests, production build, and lint
```

`tests/accounts.test.ts` covers income/expense calculations, account isolation,
negative balances, and migration from the legacy `balance` field.
`tests/persistence.test.tsx` covers account and expense entry through the real
pages, shared balance displays, saved record restoration, legacy migration with
existing transactions, malformed JSON, and account/transaction deletion.

Tests run with Vitest and React Testing Library in jsdom, using isolated
localStorage cleared before each test. They never access your browser's saved
accounts. The reload regression unmounts the entire app and mounts a fresh
provider with the same storage; it does not launch a real browser or test
cross-device sync. Add a regression here when fixing a persistence bug.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
