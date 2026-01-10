import { TemplateGenerator, TemplateContext } from '../../commands/types.js';
import fs from 'fs-extra';
import path from 'path';
import { FileGenerator } from '../../utils/file-generator.js';

export class BaseTemplate implements TemplateGenerator {
  async generate(context: TemplateContext): Promise<void> {
    const { projectPath, config } = context;
    const ext = config.language;
    
    // Create directory structure
    await this.createDirectories(projectPath, config);
    
    // Generate core files
    await Promise.all([
      this.createPackageJson(projectPath, config),
      this.createEnvFile(projectPath, config),
      this.createGitIgnore(projectPath),
      this.createReadme(projectPath, config),
      this.createServerFile(projectPath, config, context.importExtension),
      this.createAppFile(projectPath, config, context.importExtension),
      this.createLogger(projectPath, config),
      this.createHealthCheck(projectPath, config, context.importExtension),
      this.createErrorMiddleware(projectPath, config),
    ]);

    if (config.database !== 'none') {
      await this.createDatabaseUtils(projectPath, config, context.importExtension);
    }

    if (config.security !== 'none') {
      await this.createSecurityFiles(projectPath, config, context.importExtension);
    }
  }

  private async createDirectories(projectPath: string, config: any) {
    const dirs = [
      'src',
      'src/config',
      'src/controllers',
      'src/routes',
      'src/routes/v1',
      'src/middlewares',
      'src/services',
      'src/utils',
      'logs'
    ];

    if (config.database !== 'none') {
      dirs.push('src/db', 'src/models', 'src/repositories');
    }

    for (const dir of dirs) {
      await fs.ensureDir(path.join(projectPath, dir));
    }
  }

  private async createPackageJson(projectPath: string, config: any) {
    const pkg = {
      name: config.projectName,
      version: '1.0.0',
      type: 'module' as const,
      description: 'Production-ready Node.js server',
      main: config.language === 'ts' ? 'dist/server.js' : 'server.js',
      scripts: this.getPackageScripts(config),
      dependencies: this.getDependencies(config),
      devDependencies: this.getDevDependencies(config),
      engines: {
        node: '>=18.0.0'
      }
    };

    await fs.writeJson(path.join(projectPath, 'package.json'), pkg, { spaces: 2 });
  }

  private getPackageScripts(config: any) {
    const baseScripts = {
      test: 'echo "Error: no test specified" && exit 1'
    };

    if (config.language === 'ts') {
      return {
        ...baseScripts,
        build: 'tsc',
        start: 'node dist/server.js',
        dev: 'nodemon --watch src --ext ts --exec "tsx src/server.ts"',
        'dev:watch': 'tsc --watch',
        lint: 'eslint src --ext .ts',
        'type-check': 'tsc --noEmit'
      };
    } else {
      return {
        ...baseScripts,
        start: 'node server.js',
        dev: 'nodemon --watch src --ext js server.js'
      };
    }
  }

  private getDependencies(config: any) {
    const deps: Record<string, string> = {
      express: '^4.18.0',
      dotenv: '^16.0.0',
      winston: '^3.10.0'
    };

    // Security dependencies
    if (config.security !== 'none') {
      deps.helmet = '^7.0.0';
      deps.cors = '^2.8.5';
      deps['express-rate-limit'] = '^7.0.0';
      
      if (config.security === 'jwt') {
        deps.jsonwebtoken = '^9.0.0';
        deps.bcryptjs = '^2.4.3';
      }
    }

    // Database dependencies
    if (config.database !== 'none') {
      switch (config.database) {
        case 'mongodb':
          deps.mongoose = '^7.0.0';
          break;
        case 'postgres':
          deps.pg = '^8.10.0';
          break;
        case 'mysql':
          deps.mysql2 = '^3.5.0';
          break;
        case 'sqlite':
          deps.sqlite3 = '^5.1.0';
          break;
      }
    }

    return deps;
  }

  private getDevDependencies(config: any) {
    if (config.language === 'ts') {
      const devDeps: Record<string, string> = {
        typescript: '^5.0.0',
        'tsx': '^3.12.0',
        nodemon: '^3.0.0',
        '@types/node': '^20.0.0',
        '@types/express': '^4.17.0',
        '@types/cors': '^2.8.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        eslint: '^8.0.0'
      };

      if (config.security === 'jwt') {
        devDeps['@types/jsonwebtoken'] = '^9.0.0';
        devDeps['@types/bcryptjs'] = '^2.4.0';
      }

      if (config.database === 'postgres') {
        devDeps['@types/pg'] = '^8.10.0';
      }

      return devDeps;
    } else {
      return {
        nodemon: '^3.0.0'
      };
    }
  }

  private async createEnvFile(projectPath: string, config: any) {
    let content = `# Server Configuration
PORT=3000
NODE_ENV=development
`;

    if (config.database !== 'none') {
      content += `\n# Database Configuration\n`;
      content += `DATABASE_URL=\n`;
    }

    if (config.security === 'jwt') {
      content += `\n# JWT Configuration\n`;
      content += `JWT_SECRET=your_jwt_secret_key_change_this_in_production\n`;
      content += `JWT_EXPIRES_IN=7d\n`;
    }

    await fs.writeFile(path.join(projectPath, '.env.example'), content);
    await fs.writeFile(path.join(projectPath, '.env'), content);
  }

  private async createGitIgnore(projectPath: string) {
    const content = `# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build output
dist/
build/
out/

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
tmp/
temp/
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), content);
  }

  private async createReadme(projectPath: string, config: any) {
    const ext = config.language;
    const devCommand = config.language === 'ts' ? 'npm run dev' : 'npm start';
    
    const content = `# ${config.projectName}

🚀 A production-ready Node.js server created with \`create-server\`

## Project Structure

\`\`\`
${config.projectName}/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.${ext}       # Express app setup
├── package.json
├── server.${ext}        # Entry point
└── .env.example         # Environment template
\`\`\`

## Features

✅ Express.js with modern ES modules
✅ Structured project organization
✅ Winston logging with file rotation
✅ Health check endpoint
✅ Error handling middleware
${config.security !== 'none' ? '✅ Security headers (Helmet, CORS, Rate Limiting)' : ''}
${config.security === 'jwt' ? '✅ JWT authentication setup' : ''}
${config.database !== 'none' ? `✅ ${config.database} database integration` : ''}
${config.language === 'ts' ? '✅ TypeScript with strict type checking' : ''}

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Start development server:**
   \`\`\`bash
   ${devCommand}
   \`\`\`

4. **Test the API:**
   \`\`\`bash
   curl http://localhost:3000
   curl http://localhost:3000/api/v1/health
   \`\`\`

## Available Scripts

- \`${devCommand}\` - Start development server with hot reload
- \`npm start\` - Start production server
${config.language === 'ts' ? '- \`npm run build\` - Build TypeScript project\n- \`npm run type-check\` - Run TypeScript type checking\n- \`npm run lint\` - Run ESLint' : ''}
- \`npm test\` - Run tests

## Health Check

The server includes a health check endpoint at \`/api/v1/health\` that returns:
- Server status
- Timestamp
- Node.js version
- Environment

## Deployment

1. Build the project (if TypeScript):
   \`\`\`bash
   npm run build
   \`\`\`

2. Set production environment:
   \`\`\`bash
   NODE_ENV=production npm start
   \`\`\`

3. Use PM2 for process management:
   \`\`\`bash
   npm install -g pm2
   pm2 start dist/server.js --name "${config.projectName}"
   \`\`\`
`;
    await fs.writeFile(path.join(projectPath, 'README.md'), content);
  }

  private async createServerFile(projectPath: string, config: any, importExtension: string) {
    const ext = config.language;
    const filePath = path.join(projectPath, `server.${ext}`);
    
    const content = `import dotenv from 'dotenv';
import app from './src/app.${importExtension}';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`⚙️  Environment: \${NODE_ENV}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/api/v1/health\`);
  console.log(\`📝 Logs: \${NODE_ENV === 'production' ? 'logs/' : 'console'}\`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(\`\\n🛑 Received \${signal}. Shutting down gracefully...\`);
  server.close(() => {
    console.log('💤 Server stopped');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏰ Forcing shutdown after 10 seconds...');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});
`;
    await fs.writeFile(filePath, content);
  }

  private async createAppFile(projectPath: string, config: any, importExtension: string) {
    const ext = config.language;
    const filePath = path.join(projectPath, 'src', `app.${ext}`);
    
    let content = `import express from 'express';
import { httpLogger } from './config/logger.${importExtension}';
import healthRouter from './routes/v1/health.routes.${importExtension}';
import errorMiddleware from './middlewares/error.middleware.${importExtension}';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Request logging
app.use(httpLogger);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Security middleware
`;

    if (config.security !== 'none') {
      content += `import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

`;
    }

    content += `// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Server is running!',
    timestamp: new Date().toISOString(),
    docs: '/api/v1/health'
  });
});

// API routes
app.use('/api/v1/health', healthRouter);

`;

    if (config.database !== 'none') {
      content += `// Database connection
import { createConnection } from './db/db-utils.${importExtension}';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set. Database features will be disabled.');
} else {
  createConnection(databaseUrl)
    .then(conn => {
      console.log(\`✅ Connected to \${conn.type} database\`);
    })
    .catch(err => {
      console.error(\`❌ Database connection error: \${err.message}\`);
    });
}

`;
    }

    content += `// Error handling must be last
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: \`Route \${req.originalUrl} not found\`,
    timestamp: new Date().toISOString()
  });
});

export default app;
`;
    await fs.writeFile(filePath, content);
  }

  private async createLogger(projectPath: string, config: any) {
    const ext = config.language;
    const filePath = path.join(projectPath, 'src/config', `logger.${ext}`);
    
    const typeImports = config.language === 'ts' 
      ? "import { RequestHandler } from 'express';" 
      : '';
    
    const content = `import winston from 'winston';
import path from 'path';
${typeImports}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const msg = stack || message;
    return \`\${timestamp} \${level}: \${msg}\`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log')
    })
  ]
});

// HTTP request logger middleware
export const httpLogger${config.language === 'ts' ? ': RequestHandler' : ''} = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, \`\${req.method} \${req.originalUrl} \${res.statusCode} \${duration}ms\`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: \`\${duration}ms\`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};

export default logger;
`;
    await fs.writeFile(filePath, content);
  }

  private async createHealthCheck(projectPath: string, config: any, importExtension: string) {
    const ext = config.language;
    
    // Controller
    const controllerPath = path.join(projectPath, 'src/controllers', `health.controller.${ext}`);
    
    const controllerContent = config.language === 'ts' ? `import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid
  };
  
  res.json(healthData);
};`
    : `export const healthCheck = (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid
  };
  
  res.json(healthData);
};`;

    await fs.writeFile(controllerPath, controllerContent);

    // Routes
    const routesPath = path.join(projectPath, 'src/routes/v1', `health.routes.${ext}`);
    
    const routesContent = `import { Router } from 'express';
import { healthCheck } from '../../controllers/health.controller.${importExtension}';

const router = Router();

/**
 * @route GET /api/v1/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', healthCheck);

export default router;`;

    await fs.writeFile(routesPath, routesContent);
  }

  private async createErrorMiddleware(projectPath: string, config: any) {
    const ext = config.language;
    const filePath = path.join(projectPath, 'src/middlewares', `error.middleware.${ext}`);
    
    const content = config.language === 'ts' ? `import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger.js';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export default (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log error
  logger.error(\`\${req.method} \${req.originalUrl} - \${err.message}\`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Hide stack trace in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response: any = {
    success: false,
    status: statusCode,
    message: message
  };
  
  if (!isProduction) {
    response.stack = err.stack;
    if (err.code) response.code = err.code;
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    response.message = 'Validation Error';
    response.errors = (err as any).errors;
  }
  
  if (err.code === '23505') { // PostgreSQL unique violation
    response.message = 'Duplicate entry';
    response.field = err.message.match(/key \\(([^)]+)\\)/)?.[1];
  }
  
  res.status(statusCode).json(response);
};`
    : `import logger from '../config/logger.js';

export default (err, req, res, next) => {
  // Log error
  logger.error(\`\${req.method} \${req.originalUrl} - \${err.message}\`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Hide stack trace in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response = {
    success: false,
    status: statusCode,
    message: message
  };
  
  if (!isProduction) {
    response.stack = err.stack;
    if (err.code) response.code = err.code;
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    response.message = 'Validation Error';
    response.errors = err.errors;
  }
  
  if (err.code === '23505') { // PostgreSQL unique violation
    response.message = 'Duplicate entry';
    response.field = err.message.match(/key \\(([^)]+)\\)/)?.[1];
  }
  
  res.status(statusCode).json(response);
};`;

    await fs.writeFile(filePath, content);
  }

  private async createDatabaseUtils(projectPath: string, config: any, importExtension: string) {
    const ext = config.language;
    const filePath = path.join(projectPath, 'src/db', `db-utils.${ext}`);
    
    const typeImports = config.language === 'ts' 
      ? `import { Connection } from 'mongoose';
import { Pool } from 'pg';
import { Connection as MySQLConnection } from 'mysql2/promise';
import sqlite3 from 'sqlite3';

interface DatabaseConnection {
  type: string;
  connection: Connection | Pool | MySQLConnection | sqlite3.Database;
}`
      : '';
    
    const functionSignature = config.language === 'ts'
      ? 'export const createConnection = async (url: string): Promise<DatabaseConnection> => {'
      : 'export const createConnection = async (url) => {';
    
    let databaseLogic = '';
    
    switch (config.database) {
      case 'mongodb':
        databaseLogic = `    const mongoose = await import('mongoose');
    
    await mongoose.connect(url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    return {
      type: 'MongoDB',
      connection: mongoose.connection
    };`;
        break;
        
      case 'postgres':
        databaseLogic = `    const { Pool } = await import('pg');
    
    const pool = new Pool({
      connectionString: url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Test connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
    
    return {
      type: 'PostgreSQL',
      connection: pool
    };`;
        break;
        
      case 'mysql':
        databaseLogic = `    const mysql = await import('mysql2/promise');
    
    const connection = await mysql.createConnection({
      uri: url,
      connectTimeout: 10000,
      charset: 'utf8mb4'
    });
    
    return {
      type: 'MySQL',
      connection
    };`;
        break;
        
      case 'sqlite':
        databaseLogic = `    const sqlite3 = await import('sqlite3');
    const { open } = await import('sqlite');
    
    const dbPath = url.replace('sqlite://', '');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    return {
      type: 'SQLite',
      connection: db
    };`;
        break;
    }
    
    const content = `${typeImports}

${functionSignature}
  try {
${databaseLogic}
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new Error(\`Database connection failed: \${errorMessage}\`);
  }
};`;

    await fs.writeFile(filePath, content);
  }

  private async createSecurityFiles(projectPath: string, config: any, importExtension: string) {
    if (config.security !== 'jwt') return;
    
    const ext = config.language;
    
    // Auth middleware
    const middlewarePath = path.join(projectPath, 'src/middlewares', `auth.middleware.${ext}`);
    
    const middlewareContent = config.language === 'ts' ? `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is required'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bearer token is required'
    });
  }
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  }
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      logger.warn(\`JWT verification failed: \${err.message}\`);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (roles.length > 0 && (!req.user.role || !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};`
    : `import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is required'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bearer token is required'
    });
  }
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  }
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      logger.warn(\`JWT verification failed: \${err.message}\`);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (roles.length > 0 && (!req.user.role || !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};`;

    await fs.writeFile(middlewarePath, middlewareContent);

    // Auth controller (basic implementation)
    const controllerPath = path.join(projectPath, 'src/controllers', `auth.controller.${ext}`);
    
    const controllerContent = config.language === 'ts' ? `import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

// In a real application, you would import your User model here
// import User from '../models/user.model.js';

interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // In a real application, you would:
    // 1. Find user by email in database
    // 2. Compare password with bcrypt
    // 3. Generate JWT token
    
    // Example user (replace with database query)
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'user'
    };
    
    // Verify password (example)
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const token = jwt.sign(
      {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'create-server',
        audience: 'web'
      }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }
      }
    });
    
  } catch (error) {
    logger.error(\`Login error: \${error}\`);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  // Registration logic here
  res.status(501).json({
    success: false,
    message: 'Registration endpoint not implemented'
  });
};

export const getProfile = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};`
    : `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Example user (replace with database query)
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'user'
    };
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const token = jwt.sign(
      {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'create-server',
        audience: 'web'
      }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }
      }
    });
    
  } catch (error) {
    logger.error(\`Login error: \${error}\`);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const register = async (req, res) => {
  // Registration logic here
  res.status(501).json({
    success: false,
    message: 'Registration endpoint not implemented'
  });
};

export const getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};`;

    await fs.writeFile(controllerPath, controllerContent);

    // Auth routes
    const routesPath = path.join(projectPath, 'src/routes/v1', `auth.routes.${ext}`);
    
    const routesContent = `import { Router } from 'express';
import { login, register, getProfile } from '../../controllers/auth.controller.${importExtension}';
import { authenticateJWT } from '../../middlewares/auth.middleware.${importExtension}';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticateJWT, getProfile);

export default router;`;

    await fs.writeFile(routesPath, routesContent);

    // Update app.js to include auth routes
    const appFilePath = path.join(projectPath, 'src', `app.${ext}`);
    let appContent = await fs.readFile(appFilePath, 'utf-8');
    
    // Add auth import after health import
    appContent = appContent.replace(
      `import healthRouter from './routes/v1/health.routes.${importExtension}';`,
      `import healthRouter from './routes/v1/health.routes.${importExtension}';
import authRouter from './routes/v1/auth.routes.${importExtension}';`
    );
    
    // Add auth route after health route
    appContent = appContent.replace(
      `// API routes
app.use('/api/v1/health', healthRouter);`,
      `// API routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);`
    );
    
    await fs.writeFile(appFilePath, appContent);
  }
}