import fs from 'fs-extra';
import path from 'path';
export class FileGenerator {
    static async ensureProjectDir(projectPath) {
        if (await fs.pathExists(projectPath)) {
            throw new Error(`Directory "${path.basename(projectPath)}" already exists!`);
        }
        await fs.ensureDir(projectPath);
    }
    static async copyTemplate(sourceDir, destDir, context = {}) {
        if (!await fs.pathExists(sourceDir)) {
            throw new Error(`Template directory not found: ${sourceDir}`);
        }
        await fs.copy(sourceDir, destDir);
        // Get all files recursively
        const getAllFiles = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);
                return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
            }));
            return files.flat();
        };
        const files = await getAllFiles(destDir);
        for (const file of files) {
            const relativePath = path.relative(destDir, file);
            let content = await fs.readFile(file, 'utf-8');
            // Replace template variables
            for (const [key, value] of Object.entries(context)) {
                const placeholder = `{{${key}}}`;
                content = content.replace(new RegExp(placeholder, 'g'), String(value));
            }
            await fs.writeFile(file, content);
        }
    }
}
//# sourceMappingURL=file-generator.js.map