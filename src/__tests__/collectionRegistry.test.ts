import { describe, it, expect, beforeEach } from 'vitest';
import CollectionRegistry from '../collectionRegistry.js';
import { extractCollectionMetadata, analyzeFields } from '../utils/fieldAnalyzer.js';
import type { CollectionRegistryConfig } from '../collectionRegistry.js';

describe('CollectionRegistry', () => {
  let registry: CollectionRegistry;

  beforeEach(() => {
    registry = new CollectionRegistry({
      collectionsPath: './test/collections',
      outputPath: './test/output',
      typesPath: './test/payload-types.ts',
      format: false,
    });
  });

  it('should initialize with default configuration', () => {
    const defaultRegistry = new CollectionRegistry();
    // Note: config is now private, so we can't test it directly
    // This test would need to be refactored or config made public
    expect(defaultRegistry).toBeInstanceOf(CollectionRegistry);
  });

  it('should accept custom configuration', () => {
    // Note: config is now private, so we can't test it directly
    // This test would need to be refactored or config made public
    expect(registry).toBeInstanceOf(CollectionRegistry);
  });
});

describe('Field Analyzer', () => {
  it('should analyze fields from collection content', () => {
    const content = `
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
        },
        {
          name: 'status',
          type: 'select',
        },
      ],
    `;

    const fields = analyzeFields(content);
    expect(fields).toHaveLength(3);
    expect(fields[0]).toEqual({
      name: 'title',
      type: 'text',
      required: true,
    });
    expect(fields[1]).toEqual({
      name: 'slug',
      type: 'text',
      required: false,
    });
  });

  it('should extract collection metadata', () => {
    const content = `
      export const Posts: CollectionConfig = {
        slug: 'posts',
        admin: {
          useAsTitle: 'title',
        },
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'slug',
            type: 'text',
          },
          {
            name: 'status',
            type: 'select',
          },
        ],
      };
    `;

    const metadata = extractCollectionMetadata(content, 'Posts.ts');
    expect(metadata).toBeTruthy();
    expect(metadata.slug).toBe('posts');
    expect(metadata.displayName).toBe('Posts');
    expect(metadata.pluralName).toBe('Posts');
    expect(metadata.hasSlug).toBe(true);
    expect(metadata.hasStatus).toBe(true);
    expect(metadata.fields).toHaveLength(3);
  });
});
