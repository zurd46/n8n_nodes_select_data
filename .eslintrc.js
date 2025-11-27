module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/nodes'],
	ignorePatterns: ['dist/**', 'node_modules/**'],
	rules: {
		'n8n-nodes-base/node-filename-against-convention': 'off',
	},
};
