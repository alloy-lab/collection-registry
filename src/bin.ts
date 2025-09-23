#!/usr/bin/env node

/**
 * Collection Registry CLI
 *
 * Usage:
 *   collection-registry [options]
 *
 * Options:
 *   --collections-path <path>    Path to Payload collections directory
 *   --output-path <path>         Path to output generated files
 *   --types-path <path>          Path to Payload generated types
 *   --format                     Format generated files with Prettier
 *   --help                       Show help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CollectionRegistry from './collectionRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options: Record<string, any> = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  switch (arg) {
    case '--collections-path':
      options.collectionsPath = args[++i];
      break;
    case '--output-path':
      options.outputPath = args[++i];
      break;
    case '--types-path':
      options.typesPath = args[++i];
      break;
    case '--format':
      options.format = true;
      break;
    case '--help':
      showHelp();
      process.exit(0);
      break;
    default:
      if (arg && arg.startsWith('--')) {
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
      }
  }
}

function showHelp() {
  console.log(`
Collection Registry CLI

Usage:
  collection-registry [options]

Options:
  --collections-path <path>    Path to Payload collections directory (default: ./src/collections)
  --output-path <path>         Path to output generated files (default: ./generated)
  --types-path <path>          Path to Payload generated types (default: ./payload-types.ts)
  --format                     Format generated files with Prettier
  --help                       Show this help message

Examples:
  collection-registry
  collection-registry --collections-path ./cms/collections --output-path ./web/lib
  collection-registry --format
`);
}

// Set default paths if not provided
const defaultPaths = {
  collectionsPath: path.join(process.cwd(), 'src', 'collections'),
  outputPath: path.join(process.cwd(), 'generated'),
  typesPath: path.join(process.cwd(), 'payload-types.ts')
};

const config = {
  collectionsPath: options.collectionsPath || defaultPaths.collectionsPath,
  outputPath: options.outputPath || defaultPaths.outputPath,
  typesPath: options.typesPath || defaultPaths.typesPath,
  format: options.format || false
};

// Validate paths
if (!fs.existsSync(config.collectionsPath)) {
  console.error(`❌ Collections directory not found: ${config.collectionsPath}`);
  console.error('Please provide the correct path with --collections-path');
  process.exit(1);
}

if (!fs.existsSync(config.typesPath)) {
  console.error(`❌ Payload types file not found: ${config.typesPath}`);
  console.error('Please run "payload generate:types" first or provide the correct path with --types-path');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputPath)) {
  fs.mkdirSync(config.outputPath, { recursive: true });
  console.log(`📁 Created output directory: ${config.outputPath}`);
}

// Run the collection registry
async function run() {
  try {
    const registry = new CollectionRegistry(config);
    await registry.generate();
    console.log('\n🎉 Collection Registry generation complete!');
  } catch (error) {
    console.error('❌ Error running collection registry:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

run();
