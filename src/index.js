/**
 * Collection Registry - Main entry point
 *
 * This module exports the main CollectionRegistry class and utilities
 * for automated code generation from Payload CMS collections.
 */

export { default as CollectionRegistry } from './collectionRegistry.js';
export * from './generators/types.js';
export * from './utils/fieldAnalyzer.js';
export * from './utils/templateEngine.js';
