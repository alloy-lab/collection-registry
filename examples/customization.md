# Collection Registry Customization Examples

This document shows how to customize the collection-registry library to work with your specific Payload CMS setup and field naming conventions.

## Table of Contents

- [Custom Field Mappings](#custom-field-mappings)
- [Custom Status Values](#custom-status-values)
- [Custom Templates](#custom-templates)
- [Extending the Field Analyzer](#extending-the-field-analyzer)
- [Custom Type Mapping](#custom-type-mapping)
- [Debug Mode](#debug-mode)

## Custom Field Mappings

If your Payload CMS collections use different field names than the defaults, you can map them:

```typescript
import { CollectionRegistry } from '@alloylab/collection-registry';

const registry = new CollectionRegistry({
  collectionsPath: './src/collections',
  outputPath: './generated',
  typesPath: './payload-types.ts',

  // Map your custom field names to expected patterns
  fieldMappings: {
    slugField: 'urlSlug', // Use 'urlSlug' instead of 'slug'
    statusField: 'publishStatus', // Use 'publishStatus' instead of 'status'
    seoField: 'metaData', // Use 'metaData' instead of 'seo'
    navigationField: 'showInMenu', // Use 'showInMenu' instead of 'showInNavigation'
    featuredImageField: 'heroImage', // Use 'heroImage' instead of 'featuredImage'
    excerptField: 'summary', // Use 'summary' instead of 'excerpt'
    tagsField: 'categories', // Use 'categories' instead of 'tags'
    authorField: 'writer', // Use 'writer' instead of 'author'
  },
});

await registry.generate();
```

### Example Collection with Custom Field Names

```typescript
// src/collections/Articles.ts
export const Articles: CollectionConfig = {
  slug: 'articles',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'urlSlug', // Custom slug field name
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'publishStatus', // Custom status field name
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Live', value: 'live' },
      ],
      defaultValue: 'draft',
    },
    {
      name: 'metaData', // Custom SEO field name
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'showInMenu', // Custom navigation field name
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
```

## Custom Status Values

If your collections use different status values, you can customize them:

```typescript
const registry = new CollectionRegistry({
  // ... other config

  statusValues: {
    draft: 'draft',
    published: 'live', // Use 'live' instead of 'published'
    scheduled: 'scheduled',
    archived: 'hidden', // Use 'hidden' instead of 'archived'
  },
});
```

### Generated Types with Custom Status Values

```typescript
// Generated types will use your custom values
export interface Article {
  id: string;
  title: string;
  urlSlug: string;
  publishStatus: 'draft' | 'live' | 'scheduled' | 'hidden';
  metaData?: {
    title?: string;
    description?: string;
  };
  showInMenu?: boolean;
}
```

## Custom Templates

You can customize the generated code by providing your own templates:

```typescript
const registry = new CollectionRegistry({
  // ... other config

  templates: {
    collectionType: `
      export interface {{collectionName}} {
        id: string;
        {{#each fields}}
        {{name}}: {{type}};
        {{/each}}
        // Custom fields
        customField?: string;
      }
    `,

    apiClient: `
      export class {{collectionName}}Client {
        private baseUrl: string;
        
        constructor(baseUrl: string) {
          this.baseUrl = baseUrl;
        }
        
        async get{{collectionName}}s(): Promise<{{collectionName}}[]> {
          const response = await fetch(\`\${this.baseUrl}/{{collectionSlug}}\`);
          return response.json();
        }
        
        async get{{collectionName}}BySlug(slug: string): Promise<{{collectionName}}> {
          const response = await fetch(\`\${this.baseUrl}/{{collectionSlug}}/\${slug}\`);
          return response.json();
        }
      }
    `,

    routes: `
      import { {{collectionName}}Client } from './clients/{{collectionSlug}}';
      
      export const {{collectionName}}Routes = () => {
        const client = new {{collectionName}}Client(process.env.API_URL);
        
        return (
          <Routes>
            <Route path="/{{collectionSlug}}" element={<{{collectionName}}List client={client} />} />
            <Route path="/{{collectionSlug}}/:slug" element={<{{collectionName}}Detail client={client} />} />
          </Routes>
        );
      };
    `,
  },
});
```

## Extending the Field Analyzer

For more complex customizations, you can extend the field analyzer:

```typescript
import {
  FieldAnalyzer,
  CollectionMetadata,
} from '@alloylab/collection-registry';

class CustomFieldAnalyzer extends FieldAnalyzer {
  analyzeCollection(collection: any): CollectionMetadata {
    const metadata = super.analyzeCollection(collection);

    // Add custom field detection
    metadata.hasCustomField = this.detectCustomField(collection);
    metadata.hasSpecialLogic = this.detectSpecialLogic(collection);

    return metadata;
  }

  private detectCustomField(collection: any): boolean {
    // Your custom detection logic
    return (
      collection.fields?.some(
        (field: any) =>
          field.name === 'customField' && field.type === 'customType'
      ) || false
    );
  }

  private detectSpecialLogic(collection: any): boolean {
    // Your custom detection logic
    return collection.slug === 'special-collection';
  }
}

// Use the custom analyzer
const registry = new CollectionRegistry({
  // ... other config
  fieldAnalyzer: new CustomFieldAnalyzer(),
});
```

## Custom Type Mapping

You can customize how Payload field types are mapped to TypeScript types:

```typescript
import { getTypeScriptType } from '@alloylab/collection-registry';

// Extend the type mapping
const customTypeMap = {
  // Add your custom field types
  customField: 'CustomType',
  colorPicker: 'string', // Hex color string
  dateRange: '{ start: string; end: string }',
  richText: 'RichTextContent', // Your custom rich text type
};

// Override the type mapping function
function getCustomTypeScriptType(
  payloadType: string,
  fieldName: string = ''
): string {
  // Check custom mappings first
  if (customTypeMap[payloadType]) {
    return customTypeMap[payloadType];
  }

  // Special handling for specific field names
  if (fieldName === 'status' && payloadType === 'select') {
    return '"draft" | "published" | "archived"';
  }

  // Fall back to default mapping
  return getTypeScriptType(payloadType, fieldName);
}
```

### Example Collection with Custom Field Types

```typescript
// src/collections/Products.ts
export const Products: CollectionConfig = {
  slug: 'products',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'color',
      type: 'colorPicker', // Custom field type
    },
    {
      name: 'availability',
      type: 'dateRange', // Custom field type
    },
    {
      name: 'description',
      type: 'richText', // Custom rich text type
    },
  ],
};
```

## Debug Mode

Enable debug mode to see exactly what the library is doing:

```typescript
const registry = new CollectionRegistry({
  // ... other config
  debug: true, // Enable detailed logging
});

await registry.generate();
```

### Debug Output Example

```
🔍 Collection Registry Debug Mode
📁 Scanning collections in: ./src/collections
📄 Found collection file: Posts.ts
🔍 Analyzing Posts collection:
  - Slug: posts
  - Display Name: Posts
  - Fields found: 8
  - Patterns detected:
    ✅ hasSlug: true (field: slug)
    ✅ hasStatus: true (field: status)
    ✅ hasSEO: true (field: seo)
    ✅ hasNavigation: true (field: showInNavigation)
    ✅ hasFeaturedImage: true (field: featuredImage)
    ✅ hasExcerpt: true (field: excerpt)
    ❌ hasTags: false
    ❌ hasAuthor: false
  - Type mappings:
    - title: text → string
    - slug: text → string
    - status: select → "draft" | "published"
    - seo: group → any
    - showInNavigation: checkbox → boolean
    - featuredImage: upload → Media
    - excerpt: textarea → string
    - content: richText → any

📝 Generating types for Posts...
📝 Generating API client for Posts...
📝 Generating routes for Posts...
✅ Generation complete!
```

## Advanced Customization

### Custom Collection Registry Class

For maximum control, you can extend the main CollectionRegistry class:

```typescript
import { CollectionRegistry } from '@alloylab/collection-registry';

class MyCustomRegistry extends CollectionRegistry {
  async generate() {
    console.log('🚀 Starting custom generation process...');

    // Call parent generation
    await super.generate();

    // Add custom generation steps
    await this.generateCustomTypes();
    await this.generateCustomComponents();
    await this.generateDocumentation();
  }

  private async generateCustomTypes() {
    // Your custom type generation logic
    console.log('📝 Generating custom types...');
  }

  private async generateCustomComponents() {
    // Your custom component generation logic
    console.log('⚛️ Generating custom components...');
  }

  private async generateDocumentation() {
    // Your custom documentation generation logic
    console.log('📚 Generating documentation...');
  }
}

// Use your custom registry
const registry = new MyCustomRegistry({
  collectionsPath: './src/collections',
  outputPath: './generated',
  typesPath: './payload-types.ts',
});

await registry.generate();
```

### Custom CLI Command

You can also create a custom CLI command:

```typescript
// custom-cli.js
#!/usr/bin/env node

import { MyCustomRegistry } from './custom-registry.js';
import { program } from 'commander';

program
  .name('my-collection-registry')
  .description('Custom collection registry CLI')
  .version('1.0.0')
  .option('-c, --collections-path <path>', 'Path to collections', './src/collections')
  .option('-o, --output-path <path>', 'Output path', './generated')
  .option('-t, --types-path <path>', 'Types path', './payload-types.ts')
  .option('--debug', 'Enable debug mode')
  .action(async (options) => {
    const registry = new MyCustomRegistry({
      collectionsPath: options.collectionsPath,
      outputPath: options.outputPath,
      typesPath: options.typesPath,
      debug: options.debug,
    });

    try {
      await registry.generate();
      console.log('✅ Custom generation complete!');
    } catch (error) {
      console.error('❌ Generation failed:', error);
      process.exit(1);
    }
  });

program.parse();
```

## Troubleshooting Customizations

### Common Issues

1. **Custom field mappings not working**
   - Check that your field names match exactly (case-sensitive)
   - Verify the field exists in your collection configuration
   - Use debug mode to see what fields are detected

2. **Custom templates not generating**
   - Ensure your template syntax is correct
   - Check that template variables match the available data
   - Use debug mode to see what data is available

3. **Custom types not mapping correctly**
   - Verify your type mapping function is being called
   - Check that the field type matches your mapping
   - Use debug mode to see the type mapping process

### Getting Help

- Enable debug mode to see detailed logging
- Check the generated files to understand the output
- Review the source code to understand the internal logic
- Create a minimal reproduction case for complex issues

## Conclusion

The collection-registry library is designed to be transparent and customizable. By understanding its internal logic and using the provided customization options, you can adapt it to work with any Payload CMS setup and field naming conventions.

The key is to start with the basic configuration and gradually add customizations as needed. The debug mode is your friend for understanding what the library is doing and troubleshooting any issues.
