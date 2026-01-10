import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';

export async function displayBanner(): Promise<void> {
  return new Promise((resolve) => {
    figlet.text('Create Server', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }, (err, data) => {
      if (err) {
        console.log(chalk.blue('\n🚀 CREATE-SERVER-STARTUP\n'));
        resolve();
        return;
      }
      
      const gradientText = gradient.morning(data || 'CREATE SERVER');
      console.log(gradientText);
      console.log(chalk.cyan('\n🚀 Create production-ready Node.js servers in seconds!\n'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      
      resolve();
    });
  });
}