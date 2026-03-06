import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';

const presetConfig = createDefaultEsmPreset({});

export default {
  ...presetConfig,
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151002]
        }
      }
    ]
  }
} satisfies Config;
