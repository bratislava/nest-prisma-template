module.exports = {
  plugins: ['@darraghor/nestjs-typed'],
  extends: ['auto', 'plugin:@darraghor/nestjs-typed/recommended'],
  rules: {
    /** Named export is easier to refactor automatically */
    'import/prefer-default-export': 'off',
    /** Too tedious to type every function return explicitly */
    '@typescript-eslint/explicit-function-return-type': 'off',
    /** It's annoying to refactor from one style to another */
    'arrow-body-style': 'off',


    /** Links get confused for secrets */
    'no-secrets/no-secrets': ['warn', { ignoreContent: '^http' }],
    /** Too tedious */
    'eslint-comments/disable-enable-pair': 'warn',

    /** Some libraries produce a lot of eslint errors with this rule */
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'pii/no-phone-number': 'off',
    'xss/no-mixed-html': 'off',
    'pii/no-email': 'off',

    /** BE often has these in boilerplate */
    'no-underscore-dangle': 'off',

    // TODO: discuss these rules in nest-prisma-template repo
    'max-classes-per-file': 'off',
    'const-case/uppercase': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'class-methods-use-this': 'off',
    'sonarjs/prefer-immediate-return': 'off',
    'sonarjs/no-useless-catch': 'off',
    'no-useless-catch': 'warn',
    '@darraghor/nestjs-typed/api-property-returning-array-should-set-array': 'off',
  },
  ignorePatterns: [
    '*.config.*',
    '.eslintrc.js',
  ],
}