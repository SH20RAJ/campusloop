import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
	{
		ignores: ["node_modules/**", ".next/**", "out/**", "build/**", ".open-next/**", "next-env.d.ts", "cloudflare-env.d.ts"],
	},
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		plugins: {
			"@next/next": nextPlugin,
			"@typescript-eslint": tsPlugin,
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
		},
		settings: {
			react: { version: "detect" },
		},
		rules: {
			...nextPlugin.configs["core-web-vitals"].rules,
			...tsPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
];
