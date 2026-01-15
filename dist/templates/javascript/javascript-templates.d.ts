import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
export declare class JavaScriptTemplate implements TemplateGenerator {
    generate(context: TemplateContext): Promise<void>;
    private createEslintConfig;
}
