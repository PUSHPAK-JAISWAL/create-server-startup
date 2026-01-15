import fs from 'fs-extra';
import path from 'path';
export class TypeScriptTemplate {
    async generate(context) {
        const { projectPath } = context;
        // Create tsconfig.json
        await this.createTsConfig(projectPath);
        // Try to create ESLint config (optional)
        await this.createEslintConfig(projectPath).catch(() => {
            // Silently fail if ESLint config fails
        });
    }
    async createTsConfig(projectPath) {
        const tsconfig = {
            compilerOptions: {
                target: "ES2020",
                module: "ESNext",
                moduleResolution: "node",
                outDir: "dist",
                rootDir: "src",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true
            },
            include: ["src/**/*"],
            exclude: ["node_modules", "dist"]
        };
        await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
    }
    async createEslintConfig(projectPath) {
        const eslintConfig = {
            extends: ['eslint:recommended'],
            env: {
                node: true,
                es2020: true
            }
        };
        await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
    }
}
//# sourceMappingURL=typescript-templates.js.map