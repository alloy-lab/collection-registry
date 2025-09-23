/**
 * Collection Registry - Auto-detects Payload collections and generates web app code
 *
 * This system bridges the gap between Payload CMS collections and web app development
 * by automatically generating:
 * - TypeScript types
 * - API client methods
 * - React components
 * - Route files
 * - Form schemas
 * - Validation rules
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  extractCollectionMetadata
} from './utils/fieldAnalyzer.js';
import {
  generateBaseClientTemplate,
  generateBaseTypesTemplate,
  generateCollectionClientMethods
} from './utils/templateEngine.js';

class CollectionRegistry {
  constructor(config = {}) {
    this.collections = new Map();
    this.payloadTypes = '';

    // Set configuration with defaults
    this.config = {
      collectionsPath: config.collectionsPath || './src/collections',
      outputPath: config.outputPath || './generated',
      typesPath: config.typesPath || './payload-types.ts',
      format: config.format || false,
      baseUrl: config.baseUrl || 'process.env.CMS_API_URL',
      skipExamples: config.skipExamples !== false, // Default to true
      ...config
    };
  }

  /**
   * Scan CMS collections directory and extract collection metadata
   */
  scanCollections() {
    console.log('🔍 Scanning Payload collections...');

    if (!fs.existsSync(this.config.collectionsPath)) {
      console.log(`❌ Collections directory not found: ${this.config.collectionsPath}`);
      return;
    }

    const collectionFiles = fs
      .readdirSync(this.config.collectionsPath)
      .filter(file => file.endsWith('.ts') && file !== 'index.ts');

    collectionFiles.forEach(file => {
      const filePath = path.join(this.config.collectionsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = extractCollectionMetadata(content, file);

      if (metadata) {
        // Skip Examples collection if configured to do so
        if (this.config.skipExamples && metadata.slug === 'examples') {
          console.log(
            `  ⏭️  Skipping collection: ${metadata.slug} (${metadata.displayName}) - demonstration only`
          );
          return;
        }

        this.collections.set(metadata.slug, metadata);
        console.log(
          `  ✅ Found collection: ${metadata.slug} (${metadata.displayName})`
        );
      }
    });
  }


  /**
   * Load Payload generated types
   */
  loadPayloadTypes() {
    if (fs.existsSync(this.config.typesPath)) {
      this.payloadTypes = fs.readFileSync(this.config.typesPath, 'utf8');
      console.log('📄 Loaded Payload types');
    } else {
      console.log(
        `⚠️  Payload types not found at ${this.config.typesPath}, run "payload generate:types" first`
      );
    }
  }

  /**
   * Generate web app types
   */
  generateWebTypes() {
    console.log('🔧 Generating web app types...');

    // Generate base types file
    this.generateBaseTypes();

    // Generate individual collection type files
    Array.from(this.collections.values()).forEach(collection => {
      this.generateCollectionTypeFile(collection);
    });

    // Generate index file that exports everything
    this.generateTypesIndex();

    // Clean up old type files that are no longer needed
    this.cleanupOldTypeFiles();

    console.log('✅ Generated web types');
  }

  /**
   * Generate base types file
   */
  generateBaseTypes() {
    const baseTypesContent = generateBaseTypesTemplate();

    const baseTypesPath = path.join(
      this.config.outputPath,
      'types',
      'base.ts'
    );
    fs.mkdirSync(path.dirname(baseTypesPath), { recursive: true });
    fs.writeFileSync(baseTypesPath, baseTypesContent);
  }

  /**
   * Generate individual collection type file
   */
  generateCollectionTypeFile(collection) {
    const { slug, displayName, fields } = collection;

    // Clean up field definitions to avoid duplicates and type errors
    const uniqueFields = this.deduplicateFields(fields);
    const fieldDefinitions = uniqueFields
      .map(field => {
        const optional = field.required ? '' : '?';
        const type = this.getTypeScriptType(field.type, field.name);
        return `  ${field.name}${optional}: ${type};`;
      })
      .join('\n');

    // For Media collection, just re-export the base Media type
    if (slug === 'media') {
      const collectionTypeContent = `/**
 * Media collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media as BaseMedia } from './base';

// Media collection extends the base Media type
export interface Media extends BaseMedia {
  alt: string;
}

// Export for convenience
export type MediaInput = Omit<Media, 'id' | 'createdAt' | 'updatedAt'>;
export type MediaUpdate = Partial<MediaInput>;
`;
      const collectionTypePath = path.join(
        path.dirname(WEB_TYPES_PATH),
        'types',
        `${slug}.ts`
      );
      fs.writeFileSync(collectionTypePath, collectionTypeContent);
      return;
    }

    // For other collections, import Media type
    const importStatement = "import type { Media } from './base';\n\n";

    const collectionTypeContent = `/**
 * ${displayName} collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

${importStatement}export interface ${displayName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type ${displayName}Input = Omit<${displayName}, 'id' | 'createdAt' | 'updatedAt'>;
export type ${displayName}Update = Partial<${displayName}Input>;
`;

    const collectionTypePath = path.join(
      this.config.outputPath,
      'types',
      `${slug}.ts`
    );
    fs.writeFileSync(collectionTypePath, collectionTypeContent);
  }

  /**
   * Generate types index file
   */
  generateTypesIndex() {
    const collections = Array.from(this.collections.values());

    const indexContent = `/**
 * Types index - exports all collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Base types
export * from './types/base';

// Collection types
export * from './types/media';
export * from './types/pages';
export * from './types/site-settings';
export * from './types/users';

// Re-export commonly used types for convenience
export type { Media } from './types/media';
export type { Pages } from './types/pages';
export type { SiteSettings } from './types/site-settings';
export type { Email } from './types/users';
`;

    const typesIndexPath = path.join(this.config.outputPath, 'types.ts');
    fs.writeFileSync(typesIndexPath, indexContent);
  }


  /**
   * Generate API client methods
   */
  generateClientMethods() {
    console.log('🔧 Generating API client methods...');

    // Generate individual client files
    this.generateBaseClient();
    this.generateCollectionClients();
    this.generateClientIndex();
    this.generateMainClient();

    console.log('✅ Generated API client methods');
  }

  /**
   * Generate base client class
   */
  generateBaseClient() {
    const baseClientPath = path.join(
      this.config.outputPath,
      'clients',
      'base.ts'
    );
    fs.mkdirSync(path.dirname(baseClientPath), { recursive: true });

    const baseClientContent = generateBaseClientTemplate(this.config.baseUrl);
    fs.writeFileSync(baseClientPath, baseClientContent);
  }

  /**
   * Generate individual collection client files
   */
  generateCollectionClients() {
    Array.from(this.collections.values()).forEach(collection => {
      this.generateCollectionClient(collection);
    });

    // Generate site-settings client (global, not collection)
    this.generateSiteSettingsClient();

    // Clean up old client files that are no longer needed
    this.cleanupOldClientFiles();
  }

  /**
   * Generate site-settings client
   */
  generateSiteSettingsClient() {
    const clientPath = path.join(
      path.dirname(WEB_CLIENT_PATH),
      'clients',
      'site-settings.ts'
    );

    const clientContent = `/**
 * Site Settings client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { BasePayloadClient } from './base';
import type { SiteSettings } from '../types';

export class SiteSettingsClient extends BasePayloadClient {
  /**
   * Get site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/globals/site");
  }
}

export const siteSettingsClient = new SiteSettingsClient();
`;

    fs.writeFileSync(clientPath, clientContent);

    // Also generate the type file for site-settings
    this.generateSiteSettingsTypeFile();
  }

  /**
   * Generate site-settings type file
   */
  generateSiteSettingsTypeFile() {
    const typePath = path.join(
      path.dirname(WEB_TYPES_PATH),
      'types',
      'site-settings.ts'
    );

    const typeContent = `/**
 * Site Settings types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

export interface SiteSettings {
  id: string;
  siteName?: string;
  siteDescription?: string;
  logo?: any;
  favicon?: any;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string;
    defaultImage?: any;
  };
  analytics?: {
    googleAnalytics?: string;
    googleTagManager?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;
export type SiteSettingsUpdate = Partial<SiteSettingsInput>;
`;

    fs.writeFileSync(typePath, typeContent);
  }

  /**
   * Generate client for a specific collection
   */
  generateCollectionClient(collection) {
    const { slug, displayName, hasSlug, hasStatus, hasNavigation } = collection;
    const clientPath = path.join(
      this.config.outputPath,
      'clients',
      `${slug}.ts`
    );

    const methods = generateCollectionClientMethods(collection);

    const clientContent = `/**
 * ${displayName} collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { ${displayName}, PayloadResponse, QueryOptions } from '../types';
import { BasePayloadClient } from './base';

export class ${displayName}Client extends BasePayloadClient {
${methods}
}

export const ${slug}Client = new ${displayName}Client();
`;

    fs.writeFileSync(clientPath, clientContent);
  }

  /**
   * Clean up old client files that are no longer needed
   */
  cleanupOldClientFiles() {
    const clientsDir = path.join(this.config.outputPath, 'clients');

    if (!fs.existsSync(clientsDir)) {
      return;
    }

    const clientFiles = fs
      .readdirSync(clientsDir)
      .filter(
        file =>
          file.endsWith('.ts') && file !== 'base.ts' && file !== 'index.ts'
      );

    clientFiles.forEach(file => {
      const slug = file.replace('.ts', '');

      // Skip site-settings as it's a global, not a collection
      if (slug === 'site-settings') {
        return;
      }

      // If this collection is not in our current collections, delete the file
      if (!this.collections.has(slug)) {
        const filePath = path.join(clientsDir, file);
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Removed old client file: ${file}`);
      }
    });
  }

  /**
   * Clean up old type files that are no longer needed
   */
  cleanupOldTypeFiles() {
    const typesDir = path.join(this.config.outputPath, 'types');

    if (!fs.existsSync(typesDir)) {
      return;
    }

    const typeFiles = fs
      .readdirSync(typesDir)
      .filter(file => file.endsWith('.ts') && file !== 'base.ts');

    typeFiles.forEach(file => {
      const slug = file.replace('.ts', '');

      // Skip site-settings as it's a global, not a collection
      if (slug === 'site-settings') {
        return;
      }

      // If this collection is not in our current collections, delete the file
      if (!this.collections.has(slug)) {
        const filePath = path.join(typesDir, file);
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Removed old type file: ${file}`);
      }
    });
  }


  /**
   * Generate client index file
   */
  generateClientIndex() {
    const collections = Array.from(this.collections.values());
    const clientIndexPath = path.join(
      this.config.outputPath,
      'clients',
      'index.ts'
    );

    const exports = collections
      .map(
        collection =>
          `export { ${collection.slug}Client, ${collection.displayName}Client } from './${collection.slug}';`
      )
      .join('\n');

    const clientIndexContent = `/**
 * Payload clients index
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Export individual clients
${exports}
export { siteSettingsClient, SiteSettingsClient } from './site-settings';

// Export base client
export { BasePayloadClient } from './base';

// Re-export types
export type { PayloadResponse, QueryOptions } from '../types';
`;

    fs.writeFileSync(clientIndexPath, clientIndexContent);
  }

  /**
   * Generate main client file
   */
  generateMainClient() {
    const collections = Array.from(this.collections.values());

    const clientExports = collections
      .map(collection => `  ${collection.slug}Client,`)
      .join('\n');

    const legacyMethods = collections
      .map(collection => {
        const {
          slug,
          displayName,
          pluralName,
          hasSlug,
          hasStatus,
          hasNavigation,
        } = collection;
        const methods = [];

        methods.push(`  // ${displayName}`);
        methods.push(
          `  get${pluralName}: ${slug}Client.get${pluralName}.bind(${slug}Client),`
        );

        if (hasSlug) {
          methods.push(
            `  get${this.singularize(displayName)}: ${slug}Client.get${this.singularize(displayName)}.bind(${slug}Client),`
          );
        }

        if (hasStatus) {
          methods.push(
            `  getPublished${pluralName}: ${slug}Client.getPublished${pluralName}.bind(${slug}Client),`
          );
        }

        if (hasNavigation) {
          methods.push(
            `  get${pluralName}ForNavigation: ${slug}Client.get${pluralName}ForNavigation.bind(${slug}Client),`
          );
        }

        return methods.join('\n');
      })
      .join('\n\n');

    const mainClientContent = `/**
 * Main Payload client - aggregates all collection clients
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import {
  mediaClient,
  pagesClient,
  siteSettingsClient,
  usersClient,
} from './clients';

// Re-export all clients for convenience
export { mediaClient, pagesClient, siteSettingsClient, usersClient };

// Legacy compatibility - main client object
export const payloadClient = {
${legacyMethods}

  // Site Settings
  getSiteSettings: siteSettingsClient.getSiteSettings.bind(siteSettingsClient),
};

// Re-export types
export type {
  Email,
  Media,
  Pages,
  PayloadResponse,
  QueryOptions,
  SiteSettings,
} from './types';
`;

    const mainClientPath = path.join(this.config.outputPath, 'payloadClient.ts');
    fs.writeFileSync(mainClientPath, mainClientContent);
  }


  /**
   * Generate route files
   */
  generateRouteFiles() {
    console.log('🔧 Generating route files...');

    const routesPath = path.join(this.config.outputPath, 'routes');

    Array.from(this.collections.values()).forEach(collection => {
      if (!collection.hasSlug) return;

      // Generate index route
      const indexRoutePath = path.join(routesPath, `${collection.slug}._index.tsx`);
      const indexRouteContent = generateRouteTemplate(collection, 'index');
      fs.mkdirSync(path.dirname(indexRoutePath), { recursive: true });
      fs.writeFileSync(indexRoutePath, indexRouteContent);

      // Generate detail route
      const detailRoutePath = path.join(routesPath, `${collection.slug}.$slug.tsx`);
      const detailRouteContent = generateRouteTemplate(collection, 'detail');
      fs.writeFileSync(detailRoutePath, detailRouteContent);
    });

    console.log('✅ Generated route files');
  }


  /**
   * Generate a summary report
   */
  generateReport() {
    console.log('\n📊 Collection Registry Report');
    console.log('================================');

    Array.from(this.collections.values()).forEach(collection => {
      console.log(`\n📄 ${collection.displayName} (${collection.slug})`);
      console.log(`   Fields: ${collection.fields.length}`);
      console.log(`   Has Slug: ${collection.hasSlug ? '✅' : '❌'}`);
      console.log(`   Has Status: ${collection.hasStatus ? '✅' : '❌'}`);
      console.log(`   Has SEO: ${collection.hasSEO ? '✅' : '❌'}`);
      console.log(
        `   Has Navigation: ${collection.hasNavigation ? '✅' : '❌'}`
      );
      console.log(`   Public Access: ${collection.isPublic ? '✅' : '❌'}`);
    });

    console.log(`\n✅ Generated ${this.collections.size} collection(s)`);
  }


  /**
   * Format generated files with prettier
   */
  formatGeneratedFiles() {
    if (!this.config.format) {
      return;
    }

    console.log('🎨 Formatting generated files...');

    try {
      // Run prettier on the generated files
      execSync(
        `npx prettier --write "${this.config.outputPath}/**/*.ts" "${this.config.outputPath}/**/*.tsx"`,
        {
          cwd: process.cwd(),
          stdio: 'pipe',
        }
      );
      console.log('✅ Generated files formatted successfully');
    } catch (error) {
      console.warn(
        '⚠️  Warning: Could not format generated files:',
        error.message
      );
    }
  }

  /**
   * Main generation process
   */
  async generate() {
    console.log('🚀 Starting Collection Registry generation...\n');
    console.log(`📁 Collections path: ${this.config.collectionsPath}`);
    console.log(`📁 Output path: ${this.config.outputPath}`);
    console.log(`📁 Types path: ${this.config.typesPath}`);
    console.log(`🎨 Format files: ${this.config.format ? 'Yes' : 'No'}\n`);

    this.scanCollections();
    this.loadPayloadTypes();
    this.generateWebTypes();
    this.generateClientMethods();
    this.generateRouteFiles();
    this.formatGeneratedFiles();
    this.generateReport();

    console.log('\n🎉 Collection Registry generation complete!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const registry = new CollectionRegistry();
  registry.generate().catch(console.error);
}

export default CollectionRegistry;
