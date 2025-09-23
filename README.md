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

### Debug Mode

Enable debug logging:

```bash
DEBUG=collectionRegistry npx collection-registry
```

## Versioning

This package uses [Conventional Commits](https://conventionalcommits.org/) for automatic versioning:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

See [VERSIONING.md](./VERSIONING.md) for detailed information.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

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
