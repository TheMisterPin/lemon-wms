import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import unusedImports from 'eslint-plugin-unused-imports'
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.vercel/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    'src/components/ui/**'
  ]),
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      // Airbnb-style base rules
      'indent': ['error', 2],
      'linebreak-style': 'off', // Allow both CRLF and LF line endings
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      // Import organization
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          'vars': 'all',
          'varsIgnorePattern': '^_',
          'args': 'after-used',
          'argsIgnorePattern': '^_'
        }
      ],
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type'
          ],
          'pathGroups': [
            {
              'pattern': 'react',
              'group': 'external',
              'position': 'before'
            },
            {
              'pattern': 'next/**',
              'group': 'external',
              'position': 'before'
            },
            {
              'pattern': '@/**',
              'group': 'internal'
            }
          ],
          'pathGroupsExcludedImportTypes': ['react', 'next'],
          'newlines-between': 'ignore',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
      // Space after functions
      'space-before-function-paren': [
        'error',
        {
          'anonymous': 'always',
          'named': 'never',
          'asyncArrow': 'always'
        }
      ],
      // Array/Object formatting
      'array-bracket-newline': ['error', 'consistent'],
      'array-element-newline': 'off',
      'object-property-newline': 'off',
      'object-curly-newline': 'off',
      // Additional Airbnb-style rules
      'comma-dangle': ['error', 'never'],
      'no-unused-vars': 'off', // Using unused-imports instead
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: '*', next: 'return' }
      ],
      // JSX rules
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-max-props-per-line': ['error', { 'maximum': 3, 'when': 'multiline' }],
      '@next/next/jsx-no-literals': 'off'
    }
  }
])
export default eslintConfig
