import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
export declare class BaseTemplate implements TemplateGenerator {
    generate(context: TemplateContext): Promise<void>;
    private createDirectories;
    private createPackageJson;
    private getPackageScripts;
    private getDependencies;
    private getDevDependencies;
    private createEnvFile;
    private createGitIgnore;
    private createReadme;
    private createServerFile;
    private createAppFile;
    private createLogger;
    private createHealthCheck;
    private createErrorMiddleware;
    private createDatabaseUtils;
    private createSecurityFiles;
}
