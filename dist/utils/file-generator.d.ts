export declare class FileGenerator {
    static ensureProjectDir(projectPath: string): Promise<void>;
    static copyTemplate(sourceDir: string, destDir: string, context?: any): Promise<void>;
}
