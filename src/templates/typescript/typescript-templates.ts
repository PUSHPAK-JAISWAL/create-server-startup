import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
import fs from 'fs-extra';
import path from 'path';

export class TypeScriptTemplate implements TemplateGenerator {
  async generate(context: TemplateContext): Promise<void> {
    const { projectPath } = context;
    
    await Promise.all([
      this.createTsConfig(projectPath),
      this.createEslintConfig(projectPath),
      this.createTypeScriptFiles(projectPath)
    ]);
  }

  private async createTsConfig(projectPath: string) {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Node",
        outDir: "dist",
        rootDir: "src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        removeComments: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        types: ["node"],
        lib: ["ES2022"]
      },
      include: ["src/**/*.ts"],
      exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
      "ts-node": {
        "esm": true,
        "experimentalSpecifierResolution": "node"
      }
    };

    await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
  }

  private async createEslintConfig(projectPath: string) {
    const eslintConfig = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      },
      env: {
        node: true,
        es2022: true
      }
    };

    await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  private async createTypeScriptFiles(projectPath: string) {
    // Create a simple index.d.ts for global types
    const typesContent = `// Global type declarations

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
  }
}

// You can add more global types here as needed
`;

    await fs.writeFile(path.join(projectPath, 'src', 'types', 'global.d.ts'), typesContent);
    await fs.ensureDir(path.join(projectPath, 'src', 'types'));
  }
}