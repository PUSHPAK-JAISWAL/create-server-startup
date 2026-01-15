import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
export declare class TypeScriptTemplate implements TemplateGenerator {
    generate(context: TemplateContext): Promise<void>;
    private createTsConfig;
    private createEslintConfig;
}
