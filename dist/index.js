#!/usr/bin/env node
import { Command } from 'commander';
import { createProject } from './commands/create-project.js';
const program = new Command();
program
    .name('create-server')
    .description('🚀 Create production-ready Node.js servers with JavaScript or TypeScript')
    .version('1.0.0')
    .addHelpText('after', `
Examples:
  $ create-server
  $ create-server my-app --typescript
  $ create-server --help
  `);
program
    .argument('[name]', 'Project name')
    .option('-t, --typescript', 'Use TypeScript')
    .option('-d, --database <type>', 'Database type: mongodb, postgres, mysql, sqlite')
    .option('-s, --security <level>', 'Security level: basic, jwt')
    .action(createProject);
program.parse();
//# sourceMappingURL=index.js.map