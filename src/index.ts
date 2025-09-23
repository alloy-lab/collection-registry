/**
 * @fileoverview Collection Registry - Main entry point
 * @description This module exports the main CollectionRegistry class and utilities
 * for automated code generation from Payload CMS collections.
 * @version 1.0.0
 * @author Stephen Way <stephen@stephenway.net>
 * @license MIT
 */

/**
 * Main CollectionRegistry class for automated code generation
 * @example
 * ```typescript
 * import { CollectionRegistry } from '@alloylab/collection-registry';
 *
 * const registry = new CollectionRegistry({
 *   collectionsPath: './src/collections',
 *   outputPath: './generated',
 *   typesPath: './payload-types.ts'
 * });
 *
 * await registry.generate();
 * ```
 */
export { default as CollectionRegistry } from './collectionRegistry.js';

/**
 * Type generation utilities
 */
export * from './generators/types.js';

/**
 * Field analysis utilities for Payload collections
 */
export * from './utils/fieldAnalyzer.js';

/**
 * Template engine for code generation
 */
export * from './utils/templateEngine.js';
