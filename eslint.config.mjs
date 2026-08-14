import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // 작업방식 §3.2 — 자동 진행 금지 원칙을 위한 가드 (수동 점검 룰, 후일 커스텀 룰로 발전)
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.name="setInterval"]',
          message: 'setInterval 사용은 demo.time_acceleration 토글 가드 안에서만 허용 (작업방식 §3.2)',
        },
      ],
    },
  },
];

export default eslintConfig;
