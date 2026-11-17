// @ts-check
import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
// @ts-ignore
import importPlugin from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTailwindCSS from "eslint-plugin-tailwindcss";
import rxjs from "eslint-plugin-rxjs";
import angularRxjs from "eslint-plugin-rxjs-angular";
import storybook from "eslint-plugin-storybook";
import jest from "eslint-plugin-jest";

import platformPlugins from "./libs/eslint/platform/index.mjs";
import componentPlugins from "./libs/eslint/components/index.mjs";

export default tseslint.config(
  ...storybook.configs["flat/recommended"],
  {
    // Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
    files: ["**/*.ts", "**/*.js"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      //...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      eslintConfigPrettier, // Disables rules that conflict with Prettier
    ],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      rxjs: fixupPluginRules(rxjs),
      "rxjs-angular": fixupPluginRules(angularRxjs),
      "@bitwarden/platform": platformPlugins,
      "@bitwarden/components": componentPlugins,
    },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...rxjs.configs.recommended.rules,
      "rxjs-angular/prefer-takeuntil": ["error", { alias: ["takeUntilDestroyed"] }],
      "rxjs/no-exposed-subjects": ["error", { allowProtected: true }],

      // TODO: Enable these.
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/contextual-lifecycle": "error",
      "@angular-eslint/directive-class-suffix": "error",
      "@angular-eslint/no-empty-lifecycle-method": 0,
      "@angular-eslint/no-input-rename": 0,
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-output-native": 0,
      "@angular-eslint/no-output-on-prefix": 0,
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/prefer-inject": 0,
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/prefer-output-emitter-ref": "error",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/prefer-standalone": 0,
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": 0,

      "@bitwarden/platform/required-using": "error",
      "@bitwarden/platform/no-enums": "error",
      "@bitwarden/platform/no-page-script-url-leakage": "error",
      "@bitwarden/components/require-theme-colors-in-svg": "error",

      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
      "@typescript-eslint/no-explicit-any": "off", // TODO: This should be re-enabled
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/no-this-alias": ["error", { allowedNames: ["self"] }],
      "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true }],
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],

      curly: ["error", "all"],
      "no-console": "error",

      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "@bitwarden/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "src/**/*",
              group: "parent",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import/namespace": ["off"], // This doesn't resolve namespace imports correctly, but TS will throw for this anyway
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: ["libs/**/*"],
              from: ["apps/**/*"],
              message: "Libs should not import app-specific code.",
            },
            {
              target: ["libs/**/*"],
              from: ["bitwarden_license/**/*"],
              message: "Libs should not import licensed code from bitwarden_license/.",
            },
            {
              // avoid specific frameworks or large dependencies in common
              target: "./libs/common/**/*",
              from: [
                // Angular
                "./libs/angular/**/*",
                "./node_modules/@angular*/**/*",

                // Node
                "./libs/node/**/*",

                //Generator
                "./libs/tools/generator/components/**/*",
                "./libs/tools/generator/core/**/*",
                "./libs/tools/generator/extensions/**/*",

                // Import/export
                "./libs/importer/**/*",
                "./libs/tools/export/vault-export/vault-export-core/**/*",
              ],
            },
            {
              // avoid import of unexported state objects
              target: [
                "!(libs)/**/*",
                "libs/!(common)/**/*",
                "libs/common/!(src)/**/*",
                "libs/common/src/!(platform)/**/*",
                "libs/common/src/platform/!(state)/**/*",
              ],
              from: ["./libs/common/src/platform/state/**/*"],
              // allow module index import
              except: ["**/state/index.ts"],
            },
            {
              target: ["libs/**/*"],
              from: ["apps/**/*"],
              message: "Libs should not import app-specific code.",
            },
          ],
        },
      ],
      "import/no-unresolved": "off", // TODO: Look into turning off once each package is an actual package.,
    },
  },
  {
    files: ["**/*.component.ts", "**/*.directive.ts", "**/*.service.ts"],
    rules: {
      "@bitwarden/components/enforce-readonly-angular-properties": ["error", { onlyOnPush: true }],
    },
  },
  {
    // Everything in this config object targets our HTML files (external templates,
    // and inline templates as long as we have the `processor` set on our TypeScript config above)
    files: ["**/*.html"],
    extends: [
      // Apply the recommended Angular template rules
      // ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      // ...angular.configs.templateAccessibility,
    ],
    languageOptions: {
      parser: angular.templateParser,
    },
    plugins: {
      "@angular-eslint/template": angular.templatePlugin,
      tailwindcss: eslintPluginTailwindCSS,
      "@bitwarden/components": componentPlugins,
    },
    rules: {
      "@angular-eslint/template/button-has-type": "error",
      "tailwindcss/no-custom-classname": [
        "error",
        {
          // uses negative lookahead to whitelist any class that doesn't start with "tw-"
          // in other words: classnames that start with tw- must be valid TailwindCSS classes
          whitelist: ["(?!(tw)\\-).*", "tw-app-region-drag", "tw-app-region-no-drag"],
        },
      ],
      "tailwindcss/enforces-negative-arbitrary-values": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-contradicting-classname": "error",
      "@bitwarden/components/require-label-on-biticonbutton": [
        "error",
        { ignoreIfHas: ["bitPasswordInputToggle"] },
      ],
      "@bitwarden/components/no-bwi-class-usage": "warn",
      "@bitwarden/components/no-icon-children-in-bit-button": "warn",
      "@bitwarden/components/no-bit-dialog-wrapper": "error",
    },;
