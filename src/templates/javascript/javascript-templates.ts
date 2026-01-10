import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
import fs from 'fs-extra';
import path from 'path';

export class JavaScriptTemplate implements TemplateGenerator {
  async generate(context: TemplateContext): Promise<void> {
    const { projectPath } = context;
    
    // Update package.json to include ESLint for JS
    const packagePath = path.join(projectPath, 'package.json');
    const pkg = await fs.readJson(packagePath);
    
    pkg.devDependencies = {
      ...pkg.devDependencies,
      eslint: '^8.0.0',
      'eslint-config-airbnb-base': '^15.0.0',
      'eslint-plugin-import': '^2.0.0'
    };
    
    pkg.scripts.lint = 'eslint src --ext .js';
    
    await fs.writeJson(packagePath, pkg, { spaces: 2 });
    
    // Create ESLint config for JS
    await this.createEslintConfig(projectPath);
  }

  private async createEslintConfig(projectPath: string) {
    const eslintConfig = {
      extends: ['airbnb-base'],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      env: {
        node: true,
        es2022: true
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'import/extensions': ['error', 'always', { js: 'always' }],
        'no-underscore-dangle': ['error', { allow: ['_id'] }],
        'max-len': ['error', { code: 100, ignoreComments: true }]
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js']
          }
        }
      }
    };

    await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }
}