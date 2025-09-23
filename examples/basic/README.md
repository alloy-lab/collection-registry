# Basic Usage Example

This example demonstrates how to use the Collection Registry package to generate TypeScript types, API clients, and React Router routes from Payload CMS collections.

## Setup

1. Install the package:

```bash
npm install @alloylab/collection-registry
```

2. Create a simple script to run the registry:

```typescript
// generate.ts
import { CollectionRegistry } from '@alloylab/collection-registry';

const registry = new CollectionRegistry({
  collectionsPath: './src/collections',
  outputPath: './generated',
  typesPath: './payload-types.ts',
  format: true,
  skipExamples: true,
});

await registry.generate();
```

3. Run the script:

```bash
npx tsx generate.ts
```

## Generated Files

The registry will generate:

- **Types**: `generated/types/` - TypeScript interfaces for each collection
- **API Clients**: `generated/clients/` - API client methods for each collection
- **Routes**: `generated/routes/` - React Router route files
- **Index Files**: Main export files for easy importing

## CLI Usage

You can also use the CLI directly:

```bash
npx collectionRegistry --collections-path ./src/collections --output-path ./generated --format
```

## Configuration Options

- `collectionsPath`: Path to your Payload collections directory
- `outputPath`: Where to generate the output files
- `typesPath`: Path to your Payload generated types file
- `format`: Whether to format generated files with Prettier
- `skipExamples`: Whether to skip example collections
- `baseUrl`: Base URL for API client (defaults to `process.env.CMS_API_URL`)
