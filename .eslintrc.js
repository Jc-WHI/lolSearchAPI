module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // plugin과 config를 한 번에 설정
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 여기에 프로젝트에 맞는 커스텀 규칙을 추가할 수 있습니다.
    // 예: 'no-unused-vars': 'warn', // 사용되지 않는 변수는 경고 처리
  },
};