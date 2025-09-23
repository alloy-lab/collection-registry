/**
 * Types Generator - Generates TypeScript types from Payload collections
 *
 * This module provides utilities for generating TypeScript interfaces,
 * types, and related code from Payload CMS collection metadata.
 */

import type { CollectionMetadata } from '../utils/fieldAnalyzer.js';

export interface GeneratorOptions {
  includeBaseTypes?: boolean;
  includeUtilityTypes?: boolean;
  namespace?: string;
  outputFormat?: 'module' | 'namespace';
}

/**
 * Generate TypeScript interface from collection metadata
 */
export function generateCollectionInterface(
  collection: CollectionMetadata,
  options: GeneratorOptions = {}
): string {
  const { displayName, fields } = collection;
  const { includeUtilityTypes = true } = options;

  const fieldDefinitions = fields
    .map(field => {
      const optional = field.required ? '' : '?';
      const type = mapFieldTypeToTypeScript(field.type, field.name);
      return `  ${field.name}${optional}: ${type};`;
    })
    .join('\n');

  const baseInterface = `export interface ${displayName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}`;

  if (!includeUtilityTypes) {
    return baseInterface;
  }

  const utilityTypes = `
// Utility types for ${displayName}
export type ${displayName}Input = Omit<${displayName}, 'id' | 'createdAt' | 'updatedAt'>;
export type ${displayName}Update = Partial<${displayName}Input>;
export type ${displayName}Create = ${displayName}Input;`;

  return baseInterface + utilityTypes;
}

/**
 * Generate all collection interfaces
 */
export function generateAllCollectionInterfaces(
  collections: CollectionMetadata[],
  options: GeneratorOptions = {}
): string {
  const interfaces = collections
    .map(collection => generateCollectionInterface(collection, options))
    .join('\n\n');

  const baseTypes = options.includeBaseTypes ? generateBaseTypes() : '';

  const header = `/**
 * Generated TypeScript types from Payload CMS collections
 * 
 * DO NOT EDIT MANUALLY - Run collection-registry to regenerate
 */

`;

  return header + baseTypes + (baseTypes ? '\n\n' : '') + interfaces;
}

/**
 * Generate base types used across all collections
 */
export function generateBaseTypes(): string {
  return `// Base response type for Payload API
export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Media type
export interface Media {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  createdAt: string;
  updatedAt: string;
}

// Query options for API requests
export interface QueryOptions {
  limit?: number;
  page?: number;
  where?: Record<string, any>;
  sort?: string;
  draft?: boolean;
}

// SEO metadata
export interface SEOData {
  title?: string;
  description?: string;
  image?: Media;
  keywords?: string;
  canonical?: string;
  noIndex?: boolean;
}

// Navigation item
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  url?: string;
  children?: NavigationItem[];
  order?: number;
}`;
}

/**
 * Generate type index file that exports all types
 */
export function generateTypeIndex(collections: CollectionMetadata[]): string {
  const collectionExports = collections
    .map(collection => {
      const { displayName } = collection;
      return `export type { ${displayName}, ${displayName}Input, ${displayName}Update, ${displayName}Create } from './${collection.slug}';`;
    })
    .join('\n');

  return `/**
 * Type index - exports all collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run collection-registry to regenerate
 */

// Base types
export * from './base';

// Collection types
${collectionExports}

// Re-export commonly used types for convenience
${collections.map(c => `export type { ${c.displayName} } from './${c.slug}';`).join('\n')}`;
}

/**
 * Map Payload field types to TypeScript types
 */
function mapFieldTypeToTypeScript(
  payloadType: string,
  fieldName: string = ''
): string {
  const typeMap: Record<string, string> = {
    text: 'string',
    textarea: 'string',
    richText: 'any', // Could be more specific based on rich text implementation
    number: 'number',
    email: 'string',
    date: 'string',
    checkbox: 'boolean',
    select: 'string',
    radio: 'string',
    upload: 'Media',
    relationship: 'any', // Could be more specific based on relationship target
    array: 'any[]',
    group: 'any',
    blocks: 'any[]',
    json: 'any',
    code: 'string',
    point: '[number, number]', // GeoJSON Point
    collapsible: 'any',
    row: 'any',
    tabs: 'any',
  };

  // Special handling for specific field names
  if (fieldName === 'status' && payloadType === 'select') {
    return '"draft" | "published"';
  }

  if (fieldName === 'template' && payloadType === 'select') {
    return '"default" | "full-width" | "sidebar" | "landing"';
  }

  if (fieldName.toLowerCase().includes('slug')) {
    return 'string';
  }

  return typeMap[payloadType] || 'any';
}

/**
 * Generate validation schema types (for use with form libraries)
 */
export function generateValidationTypes(
  collection: CollectionMetadata
): string {
  const { displayName, fields } = collection;

  const validationFields = fields
    .map(field => {
      const rules = [];

      if (field.required) {
        rules.push('required: true');
      }

      if (field.type === 'email') {
        rules.push('email: true');
      }

      if (field.type === 'number') {
        rules.push('type: "number"');
      }

      return `  ${field.name}: { ${rules.join(', ')} }`;
    })
    .join(',\n');

  return `export const ${displayName}ValidationSchema = {
${validationFields}
};

export type ${displayName}ValidationRules = typeof ${displayName}ValidationSchema;`;
}
