# Collection Registry Troubleshooting Guide

This guide helps you diagnose and fix common issues with the collection-registry library.

## Table of Contents

- [Common Issues](#common-issues)
- [Debug Mode](#debug-mode)
- [Field Detection Issues](#field-detection-issues)
- [Type Generation Issues](#type-generation-issues)
- [Template Issues](#template-issues)
- [Configuration Issues](#configuration-issues)
- [Performance Issues](#performance-issues)

## Common Issues

### 1. Collections Not Found

**Problem:** The library can't find your collection files.

**Symptoms:**

```
❌ Collections directory not found: ./src/collections
```

**Solutions:**

1. **Check the path:** Ensure the `collectionsPath` is correct

   ```typescript
   const registry = new CollectionRegistry({
     collectionsPath: './cms/src/collections', // Verify this path
   });
   ```

2. **Check file extensions:** Collection files must have `.ts` extension

   ```
   ✅ Posts.ts
   ❌ Posts.js
   ```

3. **Check file structure:** Ensure files export a valid `CollectionConfig`

   ```typescript
   // ✅ Correct
   export const Posts: CollectionConfig = {
     slug: 'posts',
     fields: [...]
   };

   // ❌ Incorrect
   export default {
     slug: 'posts',
     fields: [...]
   };
   ```

### 2. Types Not Generated

**Problem:** TypeScript types are not being generated.

**Symptoms:**

```
❌ Payload types file not found: ./payload-types.ts
```

**Solutions:**

1. **Generate Payload types first:**

   ```bash
   npx payload generate:types
   ```

2. **Check the types path:**

   ```typescript
   const registry = new CollectionRegistry({
     typesPath: './cms/src/payload-types.ts', // Verify this path
   });
   ```

3. **Verify the types file exists:**
   ```bash
   ls -la ./cms/src/payload-types.ts
   ```

### 3. Formatting Errors

**Problem:** Prettier formatting fails.

**Symptoms:**

```
❌ Code formatting issues found. Run Prettier with --write to fix them.
```

**Solutions:**

1. **Install Prettier:**

   ```bash
   npm install prettier
   ```

2. **Check Prettier configuration:**

   ```json
   // .prettierrc
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2
   }
   ```

3. **Skip formatting:**
   ```typescript
   const registry = new CollectionRegistry({
     format: false, // Disable formatting
   });
   ```

## Debug Mode

Enable debug mode to see exactly what the library is doing:

```typescript
const registry = new CollectionRegistry({
  debug: true, // Enable detailed logging
});
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

## Field Detection Issues

### 1. Custom Field Names Not Detected

**Problem:** Your custom field names aren't being recognized.

**Example:**

```typescript
// Your collection uses 'urlSlug' instead of 'slug'
{
  name: 'urlSlug',
  type: 'text',
  required: true,
}
```

**Solution:** Use field mappings

```typescript
const registry = new CollectionRegistry({
  fieldMappings: {
    slugField: 'urlSlug', // Map 'urlSlug' to slug pattern
  },
});
```

### 2. Status Values Are Hard-coded

**Problem:** The library uses hard-coded status values.

**Example:**

```typescript
// Your collection uses 'live' instead of 'published'
{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Live', value: 'live' },
  ],
}
```

**Solution:** Customize status values

```typescript
const registry = new CollectionRegistry({
  statusValues: {
    draft: 'draft',
    published: 'live', // Use 'live' instead of 'published'
  },
});
```

### 3. Complex Field Types Not Mapped

**Problem:** Custom field types aren't mapped to TypeScript types.

**Example:**

```typescript
// Your collection has a custom field type
{
  name: 'color',
  type: 'colorPicker',
}
```

**Solution:** Extend the type mapping

```typescript
import { getTypeScriptType } from '@alloylab/collection-registry';

function getCustomTypeScriptType(
  payloadType: string,
  fieldName: string = ''
): string {
  // Add custom mappings
  if (payloadType === 'colorPicker') {
    return 'string'; // Hex color string
  }

  // Fall back to default mapping
  return getTypeScriptType(payloadType, fieldName);
}
```

## Type Generation Issues

### 1. Generated Types Are Too Generic

**Problem:** All fields are typed as `any`.

**Cause:** The library can't parse your field definitions properly.

**Solution:** Check your collection structure

```typescript
// ✅ Good structure
export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};

// ❌ Bad structure
export const Posts = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};
```

### 2. Missing Field Types

**Problem:** Some fields are missing from generated types.

**Cause:** The field parsing regex might not match your format.

**Solution:** Use debug mode to see what fields are detected

```typescript
const registry = new CollectionRegistry({
  debug: true,
});
```

### 3. Incorrect Type Mappings

**Problem:** Field types are mapped incorrectly.

**Example:**

```typescript
// Generated type
export interface Post {
  content: any; // Should be more specific
}
```

**Solution:** Customize type mapping

```typescript
function getCustomTypeScriptType(
  payloadType: string,
  fieldName: string = ''
): string {
  if (fieldName === 'content' && payloadType === 'richText') {
    return 'RichTextContent'; // Your custom type
  }

  return getTypeScriptType(payloadType, fieldName);
}
```

## Template Issues

### 1. Custom Templates Not Working

**Problem:** Your custom templates aren't being used.

**Solution:** Check template syntax

```typescript
const registry = new CollectionRegistry({
  templates: {
    collectionType: `
      export interface {{collectionName}} {
        id: string;
        {{#each fields}}
        {{name}}: {{type}};
        {{/each}}
      }
    `,
  },
});
```

### 2. Template Variables Not Available

**Problem:** Template variables are undefined.

**Solution:** Check available variables in debug mode

```typescript
const registry = new CollectionRegistry({
  debug: true,
});
```

### 3. Generated Code Has Syntax Errors

**Problem:** Generated code has TypeScript errors.

**Solution:** Check your templates for syntax issues

```typescript
// ❌ Bad template
const template = `
  export interface {{collectionName}} {
    {{#each fields}}
    {{name}}: {{type}}; // Missing semicolon
    {{/each}}
  }
`;

// ✅ Good template
const template = `
  export interface {{collectionName}} {
    {{#each fields}}
    {{name}}: {{type}};
    {{/each}}
  }
`;
```

## Configuration Issues

### 1. Configuration Not Applied

**Problem:** Your configuration changes aren't taking effect.

**Solution:** Check configuration structure

```typescript
// ✅ Correct
const registry = new CollectionRegistry({
  fieldMappings: {
    slugField: 'urlSlug',
  },
});

// ❌ Incorrect
const registry = new CollectionRegistry({
  fieldMappings: 'urlSlug', // Should be an object
});
```

### 2. Default Values Override Custom Values

**Problem:** Your custom values are being overridden by defaults.

**Solution:** Check the order of configuration

```typescript
// ✅ Correct - custom values override defaults
const registry = new CollectionRegistry({
  fieldMappings: {
    slugField: 'urlSlug', // This will override the default 'slug'
  },
});
```

### 3. Configuration Type Errors

**Problem:** TypeScript errors in configuration.

**Solution:** Use proper types

```typescript
import { CollectionRegistryConfig } from '@alloylab/collection-registry';

const config: CollectionRegistryConfig = {
  fieldMappings: {
    slugField: 'urlSlug',
  },
};
```

## Performance Issues

### 1. Slow Generation

**Problem:** Code generation is taking too long.

**Solutions:**

1. **Reduce file scanning:**

   ```typescript
   const registry = new CollectionRegistry({
     collectionsPath: './src/collections', // Only scan necessary directories
   });
   ```

2. **Disable formatting:**

   ```typescript
   const registry = new CollectionRegistry({
     format: false, // Skip Prettier formatting
   });
   ```

3. **Use caching:**
   ```typescript
   // Only regenerate when collections change
   const registry = new CollectionRegistry({
     // Add caching logic
   });
   ```

### 2. Memory Issues

**Problem:** The library uses too much memory.

**Solutions:**

1. **Process collections in batches:**

   ```typescript
   // Process collections one at a time
   for (const collection of collections) {
     await processCollection(collection);
   }
   ```

2. **Clear unused data:**
   ```typescript
   // Clear collections map after processing
   this.collections.clear();
   ```

## Getting Help

### 1. Enable Debug Mode

Always start with debug mode to understand what's happening:

```typescript
const registry = new CollectionRegistry({
  debug: true,
});
```

### 2. Check Generated Files

Look at the generated files to understand the output:

```bash
ls -la ./generated/
cat ./generated/types/posts.ts
```

### 3. Create Minimal Reproduction

Create a minimal example to isolate the issue:

```typescript
// minimal-example.ts
import { CollectionRegistry } from '@alloylab/collection-registry';

const registry = new CollectionRegistry({
  collectionsPath: './test-collections',
  outputPath: './test-generated',
  typesPath: './test-types.ts',
  debug: true,
});

await registry.generate();
```

### 4. Check Source Code

The library is designed to be transparent. Check the source code to understand the logic:

- `src/collectionRegistry.ts` - Main orchestrator
- `src/utils/fieldAnalyzer.ts` - Field detection logic
- `src/utils/templateEngine.ts` - Code generation templates

### 5. Community Support

- 📖 [Documentation](https://github.com/alloy-lab/collection-registry#readme)
- 🐛 [Issue Tracker](https://github.com/alloy-lab/collection-registry/issues)
- 💬 [Discussions](https://github.com/alloy-lab/collection-registry/discussions)

## Conclusion

The collection-registry library is designed to be transparent and debuggable. Most issues can be resolved by:

1. Enabling debug mode
2. Checking configuration
3. Verifying file paths and structure
4. Understanding the internal logic

If you're still having issues, create a minimal reproduction case and share it with the community for help.
