import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsESLint from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierExtends from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	{
		files: ['./index.ts'],
		plugins: {
			'@typescript-eslint': tsESLint,
			perfectionist,
			import: importPlugin,
			promise: promisePlugin
		},
		languageOptions: {
			globals: {
				...globals.node
			},
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname
			}
		},
		rules: {
			...js.configs.recommended.rules,
			...prettierExtends.rules,
			...tsESLint.configs.recommended.rules,
			...importPlugin.configs.recommended.rules,
			...promisePlugin.configs.recommended.rules,
			'perfectionist/sort-objects': [
				'error',
				{
					type: 'natural',
					order: 'asc'
				}
			],
			'sort-vars': 'error',
			'perfectionist/sort-jsx-props': 'error',
			'perfectionist/sort-interfaces': 'error',
			'perfectionist/sort-object-types': 'error',
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'natural',
					order: 'asc',
					newlinesBetween: 'always',
					groups: ['builtin', 'external', 'internal']
				}
			],
			'perfectionist/sort-named-imports': [
				'error',
				{
					type: 'natural',
					order: 'asc'
				}
			],
			'perfectionist/sort-union-types': [
				'error',
				{
					type: 'natural',
					order: 'asc'
				}
			],
			'@typescript-eslint/consistent-type-imports': 'error'
		}
	}
];
