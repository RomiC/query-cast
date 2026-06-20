import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/'] },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  prettier,

  {
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',

      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/unified-signatures': 'error',

      'arrow-parens': ['warn', 'always'],
      'comma-dangle': 'error',
      complexity: 'off',
      'constructor-super': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'id-blacklist': 'warn',
      'id-match': 'warn',
      'max-classes-per-file': 'off',
      'max-len': [
        'error',
        { code: 120, comments: 160, ignoreComments: false, ignoreTrailingComments: true, tabWidth: 2 }
      ],
      'new-parens': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-fallthrough': 'off',
      'no-invalid-this': 'off',
      'no-multi-spaces': 'warn',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': 'warn',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'object-curly-spacing': ['warn', 'always'],
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'prefer-const': 'error',
      quotes: ['warn', 'single'],
      'quote-props': ['warn', 'consistent-as-needed'],
      radix: 'error',
      'space-in-parens': ['warn', 'never'],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'use-isnan': 'error',
      'valid-typeof': 'off'
    }
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-shadow': 'off',
      'no-unused-expressions': 'off'
    }
  }
);
