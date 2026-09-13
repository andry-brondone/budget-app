import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const sharedRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
};

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'src/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    // Code applicatif : vérifié via le tsconfig principal (celui du build).
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: sharedRules,
  },
  {
    // Seed Prisma + scripts ponctuels : hors du rootDir du build principal
    // (rootDir: "src"), vérifiés via un tsconfig dédié (tsconfig.scripts.json).
    files: ['prisma/**/*.ts', 'scripts/**/*.ts', 'prisma.config.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.scripts.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: sharedRules,
  },
  {
    // Config ESLint elle-même + script de migration ponctuel (Phase 3) :
    // ce dernier cible intentionnellement un état intermédiaire du schéma
    // (avec l'ancien champ `category` encore présent), donc il n'est pas
    // vérifié avec les types du schéma final. Voir
    // scripts/migrate-legacy-categories.ts et tsconfig.scripts.json.
    files: ['eslint.config.js', 'scripts/migrate-legacy-categories.ts'],
    languageOptions: {
      globals: globals.node,
    },
    ...tseslint.configs.disableTypeChecked,
  },
  prettier,
);
