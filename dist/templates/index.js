import { BaseTemplate } from './base/base-template.js';
import { JavaScriptTemplate } from './javascript/javascript-templates.js';
import { TypeScriptTemplate } from './typescript/typescript-templates.js';
export async function createProjectStructure(projectPath, config) {
    const context = {
        config,
        projectPath,
        importExtension: config.language === 'ts' ? 'js' : config.language
    };
    // Create base structure
    const baseTemplate = new BaseTemplate();
    await baseTemplate.generate(context);
    // Create language-specific structure
    if (config.language === 'ts') {
        const tsTemplate = new TypeScriptTemplate();
        await tsTemplate.generate(context);
    }
    else {
        const jsTemplate = new JavaScriptTemplate();
        await jsTemplate.generate(context);
    }
}
//# sourceMappingURL=index.js.map