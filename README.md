# @alloylab/collection-registry

[![npm version](https://badge.fury.io/js/%40alloylab%2Fcollection-registry.svg)](https://badge.fury.io/js/%40alloy-lab%2Fcollection-registry)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automated code generation from Payload CMS collections. This tool bridges the gap between Payload CMS collections and web app development by automatically generating TypeScript types, API client methods, React components, and route files.

## Features

- 🔍 **Auto-detection**: Automatically scans and analyzes Payload collection files
- 📝 **Type Generation**: Generates TypeScript interfaces from collection schemas
- 🔌 **API Clients**: Creates type-safe API client methods for each collection
- ⚛️ **React Components**: Generates React Router routes and components
- 🎨 **Code Formatting**: Automatically formats generated code with Prettier
- 🔧 **Framework Agnostic**: Works with any frontend framework
- 📦 **Zero Dependencies**: Minimal dependencies for maximum compatibility

## Installation

```bash
npm install @alloylab/collection-registry
# or
yarn add @alloylab/collection-registry
# or
pnpm add @alloylab/collection-registry
```

## Quick Start

### 1. Basic Usage

```bash
# Run with default paths
npx collection-registry

# Or specify custom paths
npx collection-registry \
  --collections-path ./cms/src/collections \
  --output-path ./web/app/lib \
  --types-path ./cms/src/payload-types.ts
```

### 2. Programmatic Usage

```javascript
import { CollectionRegistry } from '@alloylab/collection-registry';

const registry = new CollectionRegistry({
  collectionsPath: './src/collections',
  outputPath: './generated',
  typesPath: './payload-types.ts',
  format: true,
});

await registry.generate();
```

## Configuration

### Command Line Options

| Option               | Description                           | Default              |
| -------------------- | ------------------------------------- | -------------------- |
| `--collections-path` | Path to Payload collections directory | `./src/collections`  |
| `--output-path`      | Path to output generated files        | `./generated`        |
| `--types-path`       | Path to Payload generated types       | `./payload-types.ts` |
| `--format`           | Format generated files with Prettier  | `false`              |
| `--help`             | Show help message                     | -                    |

### Programmatic Configuration

```javascript
const config = {
  collectionsPath: './cms/src/collections', // Required
  outputPath: './web/app/lib', // Required
  typesPath: './cms/src/payload-types.ts', // Required
  format: true, // Optional
  baseUrl: 'process.env.CMS_API_URL', // Optional
};
```

### Advanced Configuration Options

The library is designed to be transparent and customizable. You can override its assumptions:

```javascript
const config = {
  // Basic configuration
  collectionsPath: './src/collections',
  outputPath: './generated',
  typesPath: './payload-types.ts',

  // Field Detection Customization
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

  // Status Value Customization
  statusValues: {
    draft: 'draft',
    published: 'live', // Use 'live' instead of 'published'
    scheduled: 'scheduled',
    archived: 'hidden', // Use 'hidden' instead of 'archived'
  },

  // Template Customization
  templates: {
    collectionType: `
      export interface {{collectionName}} {
        id: string;
        {{#each fields}}
        {{name}}: {{type}};
        {{/each}}
      }
    `,
    apiClient: `
      export class {{collectionName}}Client {
        async get{{collectionName}}s(): Promise<{{collectionName}}[]> {
          // Custom implementation
        }
      }
    `,
  },

  // Debug Mode
  debug: true, // Enable detailed logging of the analysis process
};
```

## Generated Files

The tool generates the following files in your output directory:

### Types (`types/`)

- `base.ts` - Base types and interfaces
- `{collection}.ts` - Individual collection types
- `index.ts` - Exports all types

### API Clients (`clients/`)

- `base.ts` - Base client class
- `{collection}.ts` - Individual collection clients
- `index.ts` - Exports all clients
- `payloadClient.ts` - Main client aggregator

### Routes (optional)

- `{collection}._index.tsx` - Collection index route
- `{collection}.$slug.tsx` - Collection detail route

## 🔍 How It Works (Transparent Process)

This library is **not a black box**. Here's exactly what it does:

### 1. Collection Scanning

The library reads your Payload CMS collection files and extracts:

- Collection metadata (slug, displayName, pluralName)
- Field definitions and types
- Common patterns (slug, status, SEO, navigation, etc.)

### 2. Field Analysis

For each collection, it analyzes fields to detect:

- **Slug fields** - URL-friendly identifiers (`name: 'slug'`, `type: 'text'`)
- **Status fields** - Draft/published states (`name: 'status'`, `type: 'select'`)
- **SEO fields** - Meta data groups (`name: 'seo'`, `type: 'group'`)
- **Navigation fields** - Menu visibility (`name: 'showInNavigation'`, `type: 'checkbox'`)
- **Media fields** - Featured images (`name: 'featuredImage'`, `type: 'upload'`)
- **Content fields** - Rich text, excerpts (`name: 'excerpt'`, `type: 'textarea'`)
- **Taxonomy fields** - Tags, categories, authors (`name: 'tags'`, `type: 'array'`)

### 3. Type Generation

Creates TypeScript interfaces based on:

- Payload field types → TypeScript types
- Detected patterns → Specialized types
- Collection structure → Complete interfaces

### 4. Code Generation

Generates ready-to-use code using configurable templates.

## Collection Analysis

The tool automatically analyzes your Payload collections and detects:

- ✅ **Slug fields** - For URL-based routing
- ✅ **Status fields** - For draft/published content
- ✅ **SEO fields** - For search optimization
- ✅ **Navigation fields** - For menu generation
- ✅ **Featured images** - For content previews
- ✅ **Excerpt fields** - For content summaries
- ✅ **Tag fields** - For content categorization
- ✅ **Author fields** - For content attribution

## Example Collection

```typescript
// src/collections/Posts.ts
import type { CollectionConfig } from 'payload';

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
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
};
```

## Generated Output

### Types

```typescript
// types/posts.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  excerpt?: string;
  featuredImage?: Media;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### API Client

```typescript
// clients/posts.ts
export class PostsClient extends BasePayloadClient {
  async getPosts(options?: QueryOptions): Promise<PayloadResponse<Post>> {
    // Implementation
  }

  async getPost(slug: string, draft = false): Promise<Post> {
    // Implementation
  }

  async getPublishedPosts(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<Post[]> {
    // Implementation
  }
}
```

## Integration Examples

### React Router v7

```typescript
// app/routes/posts._index.tsx
import { postsClient } from '~/lib/clients';

export async function loader() {
  const posts = await postsClient.getPublishedPosts();
  return { posts };
}
```

### Next.js

```typescript
// pages/posts/index.tsx
import { postsClient } from '../lib/clients';

export async function getStaticProps() {
  const posts = await postsClient.getPublishedPosts();
  return { props: { posts } };
}
```

### SvelteKit

```typescript
// src/routes/posts/+page.server.ts
import { postsClient } from '$lib/clients';

export async function load() {
  const posts = await postsClient.getPublishedPosts();
  return { posts };
}
```

## Advanced Usage

### Custom Templates

You can extend the tool with custom templates:

```javascript
import { CollectionRegistry } from '@alloylab/collection-registry';

class CustomRegistry extends CollectionRegistry {
  generateCustomFiles() {
    // Your custom generation logic
  }
}
```

### Field Type Mapping

Customize TypeScript type mapping:

```javascript
import { getTypeScriptType } from '@alloylab/collection-registry';

// Extend the type mapping
const customTypeMap = {
  ...defaultTypeMap,
  customField: 'CustomType',
};
```

## 🔧 Understanding the Internal Logic

### Field Detection Algorithm

The library uses pattern matching to detect common fields. Here's exactly how it works:

```typescript
// Slug Detection
if (field.name === 'slug' && field.type === 'text') {
  return { hasSlug: true, slugField: field.name };
}

// Status Detection
if (field.name === 'status' && field.type === 'select') {
  const options = field.options || [];
  const hasDraft = options.some((opt) => opt.value === 'draft');
  const hasPublished = options.some((opt) => opt.value === 'published');
  return { hasStatus: true, statusField: field.name };
}

// SEO Detection
if (field.name === 'seo' && field.type === 'group') {
  const seoFields = field.fields || [];
  const hasTitle = seoFields.some((f) => f.name === 'title');
  const hasDescription = seoFields.some((f) => f.name === 'description');
  return { hasSEO: true, seoField: field.name };
}
```

### Type Mapping Logic

The library maps Payload field types to TypeScript types:

```typescript
const typeMap = {
  text: 'string',
  textarea: 'string',
  richText: 'any', // Rich text content
  number: 'number',
  date: 'string', // ISO date string
  select: 'string | undefined',
  checkbox: 'boolean',
  upload: 'string | Media', // File ID or Media object
  relationship: 'string | RelatedType', // ID or related object
  array: 'ArrayType[]',
  group: 'GroupType',
  blocks: 'BlockType[]',
};
```

### Customization Points

You can override any part of the analysis:

```typescript
// Custom field analyzer
class CustomFieldAnalyzer extends FieldAnalyzer {
  analyzeField(field: any): FieldAnalysis {
    // Add your custom field detection logic
    if (field.type === 'customField') {
      return { type: 'CustomType', hasCustomField: true };
    }
    return super.analyzeField(field);
  }
}

// Custom type mapper
class CustomTypeMapper extends TypeMapper {
  mapPayloadTypeToTypeScript(payloadType: string): string {
    if (payloadType === 'customField') {
      return 'CustomType';
    }
    return super.mapPayloadTypeToTypeScript(payloadType);
  }
}
```

## Troubleshooting

### Common Issues

1. **Collections not found**
   - Ensure the collections path is correct
   - Check that collection files have `.ts` extension
   - Verify collection files export a valid `CollectionConfig`

2. **Types not generated**
   - Run `payload generate:types` first
   - Check the types path is correct
   - Ensure Payload types file exists

3. **Formatting errors**
   - Install Prettier: `npm install prettier`
   - Check Prettier configuration
   - Use `--no-format` to skip formatting

4. **Custom field names not detected**
   - Use `fieldMappings` configuration to map your custom field names
   - Check the field detection logic in the debug output
   - Extend the `FieldAnalyzer` class for custom detection

5. **Status values are hard-coded**
   - Use `statusValues` configuration to customize status values
   - The library detects status fields but uses configured values for types

### Debug Mode

Enable debug logging to see exactly what the library is doing:

```bash
DEBUG=collectionRegistry npx collection-registry
```

Or programmatically:

```javascript
const registry = new CollectionRegistry({
  // ... config
  debug: true, // Enable detailed logging
});
```

This will show you:

- Which collections were found
- How each field was analyzed
- What patterns were detected
- How types were mapped
- What code was generated

## 📚 Additional Resources

- 📖 [Customization Examples](./examples/customization.md) - How to customize the library
- 🔧 [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- 🎯 [How It Works](#-how-it-works-transparent-process) - Understanding the internal logic

## Versioning

This package uses [Conventional Commits](https://conventionalcommits.org/) for automatic versioning:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

See [VERSIONING.md](./VERSIONING.md) for detailed information.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

- 🛡️ [Security Policy](SECURITY.md)
- 🤝 [Code of Conduct](CODE_OF_CONDUCT.md)
- 🐛 [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.yml)
- ✨ [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.yml)
- ❓ [Questions](.github/ISSUE_TEMPLATE/question.yml)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/alloy-lab/collection-registry#readme)
- 🐛 [Issue Tracker](https://github.com/alloy-lab/collection-registry/issues)
- 💬 [Discussions](https://github.com/alloy-lab/collection-registry/discussions)

## Related Projects

- [Overland Stack](https://github.com/alloy-lab/overland) - Full-stack template
- [Payload CMS](https://payloadcms.com/) - Headless CMS
- [React Router](https://reactrouter.com/) - Web framework
