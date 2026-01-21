import taiga from '@taiga-ui/eslint-plugin-experience-next';

export default [
    ...taiga.configs.recommended,
    {
        files: ['**/*.md'],
        rules: {'markdown/heading-increment': 'off'},
    },
];
