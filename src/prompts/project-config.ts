import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectConfig } from '../commands/types.js';

export async function promptForConfig(name?: string, options: any = {}): Promise<ProjectConfig> {
  const questions = [];
  
  if (!name) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: `${chalk.blue('➤ Project name:')}`,
      default: 'node-server',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    });
  }
  
  if (!options.typescript) {
    questions.push({
      type: 'list',
      name: 'language',
      message: `${chalk.blue('➤ Choose language:')}`,
      choices: [
        { name: `${chalk.green('JavaScript (ES Modules)')}`, value: 'js' },
        { name: `${chalk.cyan('TypeScript')}`, value: 'ts' }
      ],
      default: 'js'
    });
  }
  
  if (!options.database) {
    questions.push({
      type: 'list',
      name: 'database',
      message: `${chalk.blue('➤ Database:')}`,
      choices: [
        { name: 'None', value: 'none' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite', value: 'sqlite' }
      ],
      default: 'none'
    });
  }
  
  if (!options.security) {
    questions.push({
      type: 'list',
      name: 'security',
      message: `${chalk.blue('➤ Security features:')}`,
      choices: [
        { name: 'None', value: 'none' },
        { name: 'Basic (Helmet, CORS, Rate Limiting)', value: 'basic' },
        { name: 'JWT Authentication', value: 'jwt' }
      ],
      default: 'basic'
    });
  }
  
  const answers = await inquirer.prompt(questions);
  
  return {
    projectName: name || answers.projectName,
    language: options.typescript ? 'ts' : (answers.language || 'js'),
    database: options.database || answers.database,
    security: options.security || answers.security
  };
}