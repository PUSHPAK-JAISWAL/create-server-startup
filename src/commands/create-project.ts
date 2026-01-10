import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { ProjectConfig } from './types.js';
import { promptForConfig } from '../prompts/project-config.js';
import { displayBanner } from '../utils/banner.js';
import { createProjectStructure } from '../templates/index.js';
import { installDependencies } from '../utils/dependency-manager.js';
import { withSpinner } from '../utils/spinner.js';
import { FileGenerator } from '../utils/file-generator.js';

export async function createProject(name?: string, options: any = {}) {
  try {
    // Display welcome banner
    await displayBanner();

    // Get project configuration
    const config = await promptForConfig(name, options);

    // Create project directory
    const projectPath = path.resolve(process.cwd(), config.projectName);
    
    await withSpinner(
      'Creating project structure...',
      async () => {
        await FileGenerator.ensureProjectDir(projectPath);
        await createProjectStructure(projectPath, config);
      }
    );

    // Install dependencies
    await withSpinner(
      'Installing dependencies...',
      async () => {
        await installDependencies(projectPath, config);
      }
    );

    // Display success message
    displaySuccessMessage(projectPath, config);
    
  } catch (error: any) {
    if (error.message === 'cancelled') {
      console.log(chalk.yellow('\nOperation cancelled.'));
      return;
    }
    
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

function displaySuccessMessage(projectPath: string, config: ProjectConfig) {
  console.log(chalk.greenBright(`\n✅ Project created successfully at ${projectPath}`));
  
  console.log(chalk.yellow('\n📋 Next steps:'));
  console.log(`  ${chalk.cyan(`cd ${config.projectName}`)}`);
  
  if (config.database !== 'none') {
    console.log(chalk.yellow('\n🗄️  Database setup:'));
    console.log(`  Edit ${chalk.cyan('.env')} file and add:`);
    console.log(`  DATABASE_URL="your_${config.database}_connection_string"`);
  }
  
  console.log(chalk.yellow('\n🚀 Start development server:'));
  console.log(`  ${chalk.cyan(config.language === 'ts' ? 'npm run dev' : 'npm start')}`);
  
  console.log(chalk.yellow('\n🔍 Test the health endpoint:'));
  console.log(`  ${chalk.cyan('curl http://localhost:3000/api/v1/health')}`);
  
  console.log(chalk.yellow('\n📖 View documentation:'));
  console.log(`  ${chalk.cyan('cat README.md')}`);
}