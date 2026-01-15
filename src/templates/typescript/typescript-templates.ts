import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
import fs from 'fs-extra';
import path from 'path';

export class TypeScriptTemplate implements TemplateGenerator {
  async generate(context: TemplateContext): Promise<void> {
    const { projectPath } = context;
    
    // Create tsconfig.json
    await this.createTsConfig(projectPath);
    
    // Try to create ESLint config (optional)
    await this.createEslintConfig(projectPath).catch(() => {
      // Silently fail if ESLint config fails
    });
  }

  private async createTsConfig(projectPath: string) {
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

  private async createEslintConfig(projectPath: string) {
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