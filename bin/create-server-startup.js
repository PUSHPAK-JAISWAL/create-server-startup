#!/usr/bin/env node

// Enable source map support for debugging
require('source-map-support').register();

// Handle uncaught errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Import compiled TypeScript
require('../dist/index.js');