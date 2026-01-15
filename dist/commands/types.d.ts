export interface ProjectConfig {
    projectName: string;
    language: 'js' | 'ts';
    database: 'none' | 'mongodb' | 'postgres' | 'mysql' | 'sqlite';
    security: 'none' | 'basic' | 'jwt';
}
export interface TemplateContext {
    config: ProjectConfig;
    projectPath: string;
    importExtension: string;
}
export interface TemplateGenerator {
    generate(context: TemplateContext): Promise<void>;
}
