#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import { createSpinner } from 'nanospinner';
import figlet from 'figlet';
import gradient from 'gradient-string';
import ora from 'ora';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enhanced animated ASCII art
async function displayAnimatedBanner() {
  const gradients = [
    gradient.morning,
    gradient.passion,
    gradient.cristal,
    gradient.teen,
    gradient.mind
  ];
  
  const spinner = ora({
    text: 'Initializing CREATE-SERVER-STARTUP',
    spinner: 'dots',
    color: 'cyan'
  }).start();
  
  // Create animation sequence
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    spinner.text = gradients[i % gradients.length](
      figlet.textSync('CREATE-SERVER-STARTUP', {
        font: 'small',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 100,
        whitespaceBreak: true
      })
    );
  }
  
  spinner.succeed(gradient.passion('\n🚀 Create a production-ready Node.js server in seconds!\n'));
}

const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: `${chalk.blue('➤ Project name:')}`,
    default: 'node-server',
    validate: input => !!input.trim() || 'Project name is required'
  },
  {
    type: 'list',
    name: 'language',
    message: `${chalk.blue('➤ JavaScript or TypeScript?')}`,
    choices: [
      { name: `${chalk.green('JavaScript')}`, value: 'js' },
      { name: `${chalk.cyan('TypeScript')}`, value: 'ts' }
    ],
    default: 'js'
  },
  {
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
  },
  {
    type: 'list',
    name: 'security',
    message: `${chalk.blue('➤ Security level:')}`,
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Basic (Helmet, CORS)', value: 'basic' },
      { name: 'JWT Authentication', value: 'jwt' }
    ],
    default: 'basic'
  }
];

async function main() {
  try {
    // Display animated banner
    await displayAnimatedBanner();
    
    const answers = await inquirer.prompt(questions);
    const spinner = createSpinner('Creating project...').start();
    const projectPath = path.resolve(process.cwd(), answers.projectName);
    
    if (fs.existsSync(projectPath)) {
      spinner.error({ text: `Directory "${answers.projectName}" already exists!` });
      return;
    }
    
    await fs.ensureDir(projectPath);
    await createProjectStructure(projectPath, answers);
    spinner.success({ text: 'Project structure created' });
    
    const installSpinner = createSpinner('Installing dependencies...').start();
    await installDependencies(projectPath, answers);
    installSpinner.success({ text: 'Dependencies installed' });
    
    console.log(chalk.greenBright(`\n✅ Project created successfully at ${projectPath}`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(`cd ${answers.projectName}`);
    
    if (answers.database !== 'none') {
      console.log(chalk.yellow('\nSet your database connection:'));
      console.log('Edit .env file and add:');
      console.log(`DATABASE_URL="your_${answers.database}_connection_string"`);
    }
    
    console.log(chalk.yellow('\nStart the server:'));
    console.log(answers.language === 'ts' ? 'npm run dev' : 'npm start');
    console.log(chalk.yellow('\nTest the health endpoint:'));
    console.log('curl http://localhost:3000/api/v1/health');
    
  } catch (error) {
    if (error.message !== 'cancelled') {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

async function createProjectStructure(projectPath, answers) {
  const dirs = [
    'src',
    'src/config',
    'src/controllers',
    'src/routes',
    'src/routes/v1',
    'src/middlewares',
    'src/services',
    'src/utils'
  ];
  
  if (answers.database !== 'none') {
    dirs.push('src/db', 'src/models', 'src/repositories');
  }
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }
  
  await createPackageJson(projectPath, answers);
  await createEnvExample(projectPath, answers);
  await createGitIgnore(projectPath);
  await createReadme(projectPath, answers);
  await createServerFile(projectPath, answers);
  await createAppFile(projectPath, answers);
  await createLogger(projectPath, answers);
  await createHealthCheck(projectPath, answers);
  await createErrorMiddleware(projectPath, answers);
  
  if (answers.database !== 'none') {
    await createDbUtils(projectPath, answers);
  }
  
  if (answers.security !== 'none') {
    await createSecurityFiles(projectPath, answers);
  }
  
  if (answers.language === 'ts') {
    await createTsConfig(projectPath);
  }
}

async function createTsConfig(projectPath) {
  const tsconfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "node",
      "outDir": "dist",
      "rootDir": "src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "types": ["node"]
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules", "dist"]
  };
  
  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });
}

async function createPackageJson(projectPath, answers) {
  const pkg = {
    name: answers.projectName,
    version: '1.0.0',
    type: 'module',
    description: 'Minimal Node.js server',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1'
    },
    dependencies: {
      express: 'latest',
      dotenv: 'latest',
      winston: 'latest'
    },
    devDependencies: {}
  };

  // optional security libs
  if (answers.security !== 'none') {
    pkg.dependencies.helmet = 'latest';
    pkg.dependencies.cors = 'latest';
    pkg.dependencies['express-rate-limit'] = 'latest';
    if (answers.security === 'jwt') {
      pkg.dependencies.jsonwebtoken = 'latest';
      pkg.dependencies.bcryptjs = 'latest';
    }
  }

  // optional DB libs
  if (answers.database !== 'none') {
    switch (answers.database) {
      case 'mongodb':
        pkg.dependencies.mongoose = 'latest';
        break;
      case 'postgres':
        pkg.dependencies.pg = 'latest';
        break;
      case 'mysql':
        pkg.dependencies.mysql2 = 'latest';
        break;
      case 'sqlite':
        pkg.dependencies.sqlite3 = 'latest';
        break;
    }
  }

  if (answers.language === 'ts') {
    // TS configuration
    pkg.main = 'dist/server.js';
    pkg.scripts = {
      ...pkg.scripts,
      build: 'tsc',
      start: 'node dist/server.js',
      dev: 'nodemon --watch server.ts --ext ts --exec "node --loader ts-node/esm server.ts"'
    };

    pkg.devDependencies = {
      typescript: 'latest',
      'ts-node': 'latest',
      nodemon: 'latest',
      '@types/node': 'latest',
      '@types/express': 'latest'
    };

    // add type defs for security
    if (answers.security === 'jwt') {
      pkg.devDependencies['@types/jsonwebtoken'] = 'latest';
      pkg.devDependencies['@types/bcryptjs'] = 'latest';
    }

    // add type defs for DB
    if (answers.database === 'mongodb') {
      pkg.devDependencies['@types/mongoose'] = 'latest';
    } else if (answers.database === 'postgres') {
      pkg.devDependencies['@types/pg'] = 'latest';
    }
  } else {
    // JS configuration
    pkg.main = 'server.js';
    pkg.scripts = {
      ...pkg.scripts,
      start: 'node server.js',
      dev: 'nodemon --watch server.js --exec "node server.js"'
    };
    pkg.devDependencies.nodemon = 'latest';
  }

  await fs.writeJson(path.join(projectPath, 'package.json'), pkg, { spaces: 2 });
}

async function createEnvExample(projectPath, answers) {
  let content = `# Server configuration
PORT=3000
NODE_ENV=development
`;
  
  if (answers.database !== 'none') {
    content += `\n# Database configuration
DATABASE_URL=\n`;
  }
  
  if (answers.security === 'jwt') {
    content += `\n# JWT configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d\n`;
  }
  
  await fs.writeFile(path.join(projectPath, '.env.example'), content);
}

async function createGitIgnore(projectPath) {
  const content = `# Dependencies
node_modules/

# Environment variables
.env

# Logs
logs/
*.log

# OS files
.DS_Store

# Build output
dist/
`;
  await fs.writeFile(path.join(projectPath, '.gitignore'), content);
}

async function createReadme(projectPath, answers) {
  const content = `# ${answers.projectName}

🚀 A Node.js server created with \`create-server\`

## Project Structure
\`\`\`
${answers.projectName}/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── routes/              # Route definitions
│   ├── middlewares/         # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── app.${answers.language}        # Express app setup
├── .gitignore
├── package.json
└── server.${answers.language}       # Entry point
\`\`\`

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the server:
\`\`\`bash
${answers.language === 'ts' ? 'npm run dev' : 'npm start'}
\`\`\`

3. Test the API:
\`\`\`bash
curl http://localhost:3000
curl http://localhost:3000/api/v1/health
\`\`\`
`;
  await fs.writeFile(path.join(projectPath, 'README.md'), content);
}

async function createServerFile(projectPath, answers) {
  const ext = answers.language;
  const filePath = path.join(projectPath, `server.${ext}`);
  
  // For TypeScript, import app from './src/app.js'
  const importExtension = answers.language === 'ts' ? 'js' : ext;
  
  const content = `import dotenv from 'dotenv';
import app from './src/app.${importExtension}';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`⚙️  Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/api/v1/health\`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server stopped');
    process.exit(0);
  });
});
`;
  
  await fs.writeFile(filePath, content);
}

async function createAppFile(projectPath, answers) {
  const ext = answers.language;
  const filePath = path.join(projectPath, 'src', `app.${ext}`);
  
  // For TypeScript, use .js extensions in imports
  const importExtension = answers.language === 'ts' ? 'js' : ext;
  
  let content = `import express from 'express';
import { httpLogger } from './config/logger.${importExtension}';
import healthRouter from './routes/v1/health.routes.${importExtension}';
import errorMiddleware from './middlewares/error.middleware.${importExtension}';
${answers.database !== 'none' ? `import { createConnection } from './db/db-utils.${importExtension}';` : ''}

const app = express();

// Middleware
app.use(express.json());
app.use(httpLogger);
`;

  if (answers.security !== 'none') {
    content += `
// Security middleware
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
}));
`;
  }

  content += `
// Routes
app.get('/', (req, res) => {
  res.send('🚀 Node.js Server is running!');
});

// API Routes
app.use('/api/v1/health', healthRouter);
`;

  if (answers.database !== 'none') {
    content += `
// Database connection
createConnection(process.env.DATABASE_URL)
  .then(conn => {
    console.log(\`✅ Connected to \${conn.type} database\`);
  })
  .catch(err => {
    console.error(\`❌ Database connection error: \${err.message}\`);
  });
`;
  }

  content += `
// Error handling middleware
app.use(errorMiddleware);

export default app;
`;
  
  await fs.writeFile(filePath, content);
}

async function createLogger(projectPath, answers) {
  const ext = answers.language;
  const filePath = path.join(projectPath, 'src/config', `logger.${ext}`);

  // build only the logger body here
  let loggerBody = '';
  if (answers.language === 'ts') {
    loggerBody = `
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export const httpLogger: RequestHandler = (req, res, next) => {
  logger.info(\`\${req.method} \${req.originalUrl}\`);
  next();
};
`;
  } else {
    loggerBody = `
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export const httpLogger = (req, res, next) => {
  logger.info(\`\${req.method} \${req.originalUrl}\`);
  next();
};
`;
  }

  // assemble final content with exactly one import of RequestHandler in TS
  const content = `import winston from 'winston';
${answers.language === 'ts' ? "import { RequestHandler } from 'express';" : ''}

${loggerBody}

export default logger;
`;

  await fs.writeFile(filePath, content);
}

async function createHealthCheck(projectPath, answers) {
  const ext = answers.language;
  
  // Controller
  const controllerPath = path.join(projectPath, 'src/controllers', `health.controller.${ext}`);
  let controllerContent = '';
  
  if (answers.language === 'ts') {
    controllerContent = `import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
};`;
  } else {
    controllerContent = `export const healthCheck = (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
};`;
  }
  
  await fs.writeFile(controllerPath, controllerContent);
  
  // Routes
  const routesPath = path.join(projectPath, 'src/routes/v1', `health.routes.${ext}`);
  let routesContent = '';
  
  if (answers.language === 'ts') {
    routesContent = `import { Router } from 'express';
import { healthCheck } from '../../controllers/health.controller.js';

const router = Router();

router.get('/', healthCheck);

export default router;`;
  } else {
    routesContent = `import { Router } from 'express';
import { healthCheck } from '../../controllers/health.controller.js';

const router = Router();

router.get('/', healthCheck);

export default router;`;
  }
  
  await fs.writeFile(routesPath, routesContent);
}

async function createErrorMiddleware(projectPath, answers) {
  const ext = answers.language;
  const filePath = path.join(projectPath, 'src/middlewares', `error.middleware.${ext}`);
  
  let content = '';
  
  if (answers.language === 'ts') {
    content = `import { NextFunction, Request, Response } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

export default (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};`;
  } else {
    content = `export default (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};`;
  }
  
  await fs.writeFile(filePath, content);
}

async function createDbUtils(projectPath, answers) {
  const ext = answers.language;
  const filePath = path.join(projectPath, 'src/db', `db-utils.${ext}`);
  
  let content = '';
  
  if (answers.language === 'ts') {
    content = `import { Connection } from 'mongoose';
import { Pool } from 'pg';
import { Connection as MySQLConnection } from 'mysql2/promise';
import sqlite3 from 'sqlite3';

interface DatabaseConnection {
  type: string;
  connection: Connection | Pool | MySQLConnection | sqlite3.Database;
}

export const createConnection = async (url: string): Promise<DatabaseConnection> => {
  try {
    if (url.startsWith('mongodb')) {
      const mongoose = await import('mongoose');
      await mongoose.connect(url);
      return { type: 'MongoDB', connection: mongoose.connection };
    }
    
    if (url.startsWith('postgres')) {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: url });
      await pool.connect();
      return { type: 'PostgreSQL', connection: pool };
    }
    
    if (url.startsWith('mysql')) {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection(url);
      return { type: 'MySQL', connection };
    }
    
    if (url.startsWith('sqlite')) {
      const sqlite3 = await import('sqlite3');
      const db = new sqlite3.Database(url.replace('sqlite://', ''));
      return { type: 'SQLite', connection: db };
    }
    
    throw new Error('Unsupported database type');
  } catch (error: any) {
    throw new Error(\`Database connection failed: \${error.message}\`);
  }
};`;
  } else {
    content = `export const createConnection = async (url) => {
  try {
    if (url.startsWith('mongodb')) {
      const mongoose = await import('mongoose');
      await mongoose.connect(url);
      return { type: 'MongoDB', connection: mongoose.connection };
    }
    
    if (url.startsWith('postgres')) {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: url });
      await pool.connect();
      return { type: 'PostgreSQL', connection: pool };
    }
    
    if (url.startsWith('mysql')) {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection(url);
      return { type: 'MySQL', connection };
    }
    
    if (url.startsWith('sqlite')) {
      const sqlite3 = await import('sqlite3');
      const db = new sqlite3.Database(url.replace('sqlite://', ''));
      return { type: 'SQLite', connection: db };
    }
    
    throw new Error('Unsupported database type');
  } catch (error) {
    throw new Error(\`Database connection failed: \${error.message}\`);
  }
};`;
  }
  
  await fs.writeFile(filePath, content);
}

async function createSecurityFiles(projectPath, answers) {
  const ext = answers.language;
  
  if (answers.security === 'jwt') {
    // Auth middleware
    const middlewarePath = path.join(projectPath, 'src/middlewares', `auth.middleware.${ext}`);
    let middlewareContent = '';
    
    if (answers.language === 'ts') {
      middlewareContent = `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        logger.warn(\`JWT verification failed: \${err.message}\`);
        return res.sendStatus(403);
      }
      
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};`;
    } else {
      middlewareContent = `import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn(\`JWT verification failed: \${err.message}\`);
        return res.sendStatus(403);
      }
      
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};`;
    }
    
    await fs.writeFile(middlewarePath, middlewareContent);

    // Auth controller
    const controllerPath = path.join(projectPath, 'src/controllers', `auth.controller.${ext}`);
    let controllerContent = '';
    
    if (answers.language === 'ts') {
      controllerContent = `import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
${answers.database !== 'none' ? `// Import your User model here
// import User from '../models/user.model.${ext}';` : ''}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would fetch user from database
    // const user = await User.findOne({ email });
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 10)
    };
    
    // Check if user exists
    if (email !== mockUser.email) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};`;
    } else {
      controllerContent = `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
${answers.database !== 'none' ? `// Import your User model here
// import User from '../models/user.model.${ext}';` : ''}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would fetch user from database
    // const user = await User.findOne({ email });
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 10)
    };
    
    // Check if user exists
    if (email !== mockUser.email) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};`;
    }
    
    await fs.writeFile(controllerPath, controllerContent);

    // Auth routes
    const routesPath = path.join(projectPath, 'src/routes/v1', `auth.routes.${ext}`);
    await fs.writeFile(routesPath, `import { Router } from 'express';
import { login } from '../../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);

export default router;
`);

    // Update app file
    const appFilePath = path.join(projectPath, 'src', `app.${ext}`);
    let appContent = await fs.readFile(appFilePath, 'utf-8');
    
    appContent = appContent.replace(
      'import healthRouter from \'./routes/v1/health.routes',
      `import healthRouter from './routes/v1/health.routes.js';\nimport authRouter from './routes/v1/auth.routes.js';`
    );
    
    appContent = appContent.replace(
      'app.use(\'/api/v1/health\', healthRouter);',
      `app.use('/api/v1/health', healthRouter);\napp.use('/api/v1/auth', authRouter);`
    );
    
    await fs.writeFile(appFilePath, appContent);
  }
}

async function installDependencies(projectPath, answers) {
  await execa('npm', ['install'], { 
    cwd: projectPath, 
    stdio: 'inherit' 
  });
}

// Start the CLI
main();