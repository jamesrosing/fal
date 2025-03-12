export default {
  '*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
  ],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': [
    'prettier --write',
  ],
} 