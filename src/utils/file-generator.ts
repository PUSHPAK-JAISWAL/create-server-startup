import fs from 'fs-extra';
import path from 'path';

export class FileGenerator {
  static async ensureProjectDir(projectPath: string): Promise<void> {
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory "${path.basename(projectPath)}" already exists!`);
    }
    
    await fs.ensureDir(projectPath);
  }

  static async copyTemplate(sourceDir: string, destDir: string, context: any = {}): Promise<void> {
    if (!await fs.pathExists(sourceDir)) {
      throw new Error(`Template directory not found: ${sourceDir}`);
    }
    
    await fs.copy(sourceDir, destDir);
    
    // Process template files if needed
    const files = await fs.readdir(destDir, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(destDir, file);
      if ((await fs.stat(filePath)).isFile()) {
        let content = await fs.readFile(filePath, 'utf-8');
        
        // Replace template variables
        for (const [key, value] of Object.entries(context)) {
          const placeholder = `{{${key}}}`;
          content = content.replace(new RegExp(placeholder, 'g'), String(value));
        }
        
        await fs.writeFile(filePath, content);
      }
    }
  }
}