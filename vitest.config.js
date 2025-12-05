import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            testTimeout: 15000,
            environment: 'jsdom',
            setupFiles: './src/setupTests.js',
            globals: true,
            coverage: {
                provider: 'istanbul',
                reporter: ['text', 'lcov', 'html'],   // <-- html para ver el informe
                reportsDirectory: 'coverage',
                exclude: [
                    'public/**',
                    '**/*.css',
                    '**/*.scss',
                    '**/*.sass',
                    '**/*.png',
                    '**/*.jpg',
                    '**/*.jpeg',
                    '**/*.gif',
                    '**/*.svg',
                ],
            },
            exclude: [...configDefaults.exclude, 'e2e/**'],
        },
    })
);
