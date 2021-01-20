module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|jsx)?$',
  moduleFileExtensions: ['js', 'jsx', 'json'],
}
