import { execa } from 'execa';
import chalk from 'chalk';

export async function installDependencies(projectPath: string, config: any): Promise<void> {
  try {
    // Install dependencies
    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });
    
    console.log(chalk.green('\n✅ Dependencies installed successfully'));
    
    // Initialize git repository
    await execa('git', ['init'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    await execa('git', ['add', '.'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    await execa('git', ['commit', '-m', 'Initial commit from create-server'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    console.log(chalk.green('✅ Git repository initialized'));
    
  } catch (error: any) {
    // Check if it's a network error
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.log(chalk.yellow('\n⚠️  Network issue detected. You can manually install dependencies:'));
      console.log(chalk.cyan(`  cd ${config.projectName}`));
      console.log(chalk.cyan('  npm install'));
    } else {
      throw error;
    }
  }
}