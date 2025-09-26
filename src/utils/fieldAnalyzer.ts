/**
 * Field Analyzer - Analyzes Payload collection fields
 *
 * This utility extracts and analyzes field metadata from Payload collection files
 * to generate appropriate TypeScript types and API client methods.
 *
 * The analysis process is transparent and works by:
 * 1. Parsing collection file content using regex patterns
 * 2. Extracting field definitions (name, type, required)
 * 3. Detecting common patterns (slug, status, SEO, etc.)
 * 4. Mapping Payload types to TypeScript types
 *
 * This approach is intentionally simple and predictable, making it easy to
 * understand and customize for different use cases.
 */

// Type definitions
export interface FieldMetadata {
  name: string;
  type: string;
  required: boolean;
}

export interface CollectionMetadata {
  slug: string;
  displayName: string;
  pluralName: string;
  filename: string;
  fields: FieldMetadata[];
  hasSlug: boolean;
  hasStatus: boolean;
  hasSEO: boolean;
  hasNavigation: boolean;
  hasFeaturedImage: boolean;
  hasExcerpt: boolean;
  hasTags: boolean;
  hasAuthor: boolean;
  isPublic: boolean;
}

/**
 * Analyze collection fields from file content
 *
 * This function parses Payload CMS collection file content and extracts field definitions.
 * It uses regex patterns to find field definitions in the collection configuration.
 *
 * The parsing logic looks for:
 * - Field names: `name: 'fieldName'` or `name: "fieldName"`
 * - Field types: `type: 'fieldType'` or `type: "fieldType"`
 * - Required flags: `required: true`
 *
 * @param content - The raw file content of a Payload collection file
 * @returns Array of FieldMetadata objects representing each field
 *
 * @example
 * ```typescript
 * const content = `
 * fields: [
 *   { name: 'title', type: 'text', required: true },
 *   { name: 'slug', type: 'text', required: true },
 *   { name: 'status', type: 'select', options: [...] }
 * ]
 * `;
 * const fields = analyzeFields(content);
 * // Returns: [
 * //   { name: 'title', type: 'text', required: true },
 * //   { name: 'slug', type: 'text', required: true },
 * //   { name: 'status', type: 'select', required: false }
 * // ]
 * ```
 */
export function analyzeFields(content: string): FieldMetadata[] {
  const fields: FieldMetadata[] = [];

  // Simple field extraction (could be more sophisticated)
  const fieldMatches = content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g);

  for (const match of fieldMatches) {
    const fieldName = match[1];
    const fieldStart = match.index;

    if (!fieldName || fieldStart === undefined) continue;

    // Find the field type
    const typeMatch = content
      .substring(fieldStart)
      .match(/type:\s*['"`]([^'"`]+)['"`]/);
    const fieldType = typeMatch && typeMatch[1] ? typeMatch[1] : 'text';

    fields.push({
      name: fieldName,
      type: fieldType,
      required: content
        .substring(fieldStart, fieldStart + 200)
        .includes('required: true'),
    });
  }

  return fields;
}

/**
 * Extract collection metadata from file content
 *
 * This function analyzes a Payload CMS collection file and extracts comprehensive
 * metadata including field patterns and collection properties.
 *
 * The analysis process:
 * 1. Extracts the collection slug from `slug: 'collection-name'`
 * 2. Determines display name from `useAsTitle` or derives from slug
 * 3. Analyzes all fields to detect common patterns
 * 4. Determines if the collection is public (has `read: () => true`)
 *
 * Pattern detection looks for these specific field names:
 * - `slug` - URL-friendly identifier
 * - `status` - Draft/published state management
 * - `seo` - SEO metadata group
 * - `showInNavigation` - Navigation menu visibility
 * - `featuredImage` - Featured image field
 * - `excerpt` - Content summary field
 * - `tags` - Content categorization
 * - `author` - Content attribution
 *
 * @param content - The raw file content of a Payload collection file
 * @param filename - The filename for error reporting
 * @returns CollectionMetadata object or null if parsing fails
 *
 * @example
 * ```typescript
 * const content = `
 * export const Posts: CollectionConfig = {
 *   slug: 'posts',
 *   admin: { useAsTitle: 'title' },
 *   access: { read: () => true },
 *   fields: [
 *     { name: 'title', type: 'text', required: true },
 *     { name: 'slug', type: 'text', required: true },
 *     { name: 'status', type: 'select', options: [...] }
 *   ]
 * };
 * `;
 * const metadata = extractCollectionMetadata(content, 'Posts.ts');
 * // Returns: {
 * //   slug: 'posts',
 * //   displayName: 'Posts',
 * //   pluralName: 'Posts',
 * //   filename: 'Posts.ts',
 * //   fields: [...],
 * //   hasSlug: true,
 * //   hasStatus: true,
 * //   hasSEO: false,
 * //   // ... other pattern flags
 * // }
 * ```
 */
export function extractCollectionMetadata(
  content: string,
  filename: string
): CollectionMetadata | null {
  try {
    // Extract slug
    const slugMatch = content.match(/slug:\s*['"`]([^'"`]+)['"`]/);
    if (!slugMatch) return null;

    const slug = slugMatch[1];
    if (!slug) return null;

    // Extract display name from useAsTitle or default to slug
    const titleMatch = content.match(/useAsTitle:\s*['"`]([^'"`]+)['"`]/);
    let displayName =
      titleMatch && titleMatch[1]
        ? capitalize(titleMatch[1])
        : capitalize(slug);

    // Special case: if useAsTitle is 'title', use the collection slug as display name
    if (titleMatch && titleMatch[1] === 'title') {
      displayName = capitalize(slug);
    }

    // Analyze fields
    const fields = analyzeFields(content);

    return {
      slug,
      displayName,
      pluralName: pluralize(displayName),
      filename,
      fields,
      hasSlug: fields.some((f) => f.name === 'slug'),
      hasStatus: fields.some((f) => f.name === 'status'),
      hasSEO: fields.some((f) => f.name === 'seo'),
      hasNavigation: fields.some((f) => f.name === 'showInNavigation'),
      hasFeaturedImage: fields.some((f) => f.name === 'featuredImage'),
      hasExcerpt: fields.some((f) => f.name === 'excerpt'),
      hasTags: fields.some((f) => f.name === 'tags'),
      hasAuthor: fields.some((f) => f.name === 'author'),
      isPublic: content.includes('read: () => true'),
    };
  } catch (error) {
    console.error(
      `Error parsing ${filename}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Map Payload field types to TypeScript types
 *
 * This function converts Payload CMS field types to their TypeScript equivalents.
 * It includes special handling for common field patterns and provides sensible
 * defaults for unknown types.
 *
 * The mapping logic:
 * 1. Maps basic Payload types to TypeScript types
 * 2. Provides special handling for specific field names (status, template)
 * 3. Returns 'any' for unknown types as a fallback
 *
 * Special field name handling:
 * - `status` fields with `select` type → `"draft" | "published"`
 * - `template` fields with `select` type → `"default" | "full-width" | "sidebar" | "landing"`
 *
 * @param payloadType - The Payload CMS field type (e.g., 'text', 'select', 'upload')
 * @param fieldName - The field name for special handling (optional)
 * @returns TypeScript type string
 *
 * @example
 * ```typescript
 * getTypeScriptType('text'); // 'string'
 * getTypeScriptType('select', 'status'); // '"draft" | "published"'
 * getTypeScriptType('upload'); // 'Media'
 * getTypeScriptType('unknown'); // 'any'
 * ```
 */
export function getTypeScriptType(
  payloadType: string,
  fieldName: string = ''
): string {
  const typeMap: Record<string, string> = {
    text: 'string',
    textarea: 'string',
    richText: 'any',
    number: 'number',
    email: 'string',
    date: 'string',
    checkbox: 'boolean',
    select: 'string',
    radio: 'string',
    upload: 'Media',
    relationship: 'any',
    array: 'any[]',
    group: 'any',
    blocks: 'any[]',
  };

  // Special handling for specific field names
  if (fieldName === 'status' && payloadType === 'select') {
    return '"draft" | "published"';
  }

  if (fieldName === 'template' && payloadType === 'select') {
    return '"default" | "full-width" | "sidebar" | "landing"';
  }

  return typeMap[payloadType] || 'any';
}

/**
 * Deduplicate fields to avoid conflicts
 */
export function deduplicateFields(fields: FieldMetadata[]): FieldMetadata[] {
  const seen = new Set();
  return fields.filter((field) => {
    if (seen.has(field.name)) {
      return false;
    }
    seen.add(field.name);
    return true;
  });
}

// Utility functions
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(str: string): string {
  // Handle special cases - words that are already plural or have irregular plurals
  if (str === 'Media') return 'Media';
  if (str === 'Pages') return 'Pages';
  if (str === 'Users') return 'Users';
  if (str === 'Posts') return 'Posts'; // Already plural
  if (str === 'Examples') return 'Examples'; // Already plural

  // Standard pluralization
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  } else if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch')) {
    return str + 'es';
  } else {
    return str + 's';
  }
}

export function singularize(str: string): string {
  // Handle special cases
  if (str === 'Media') return 'Media';
  if (str === 'Pages') return 'Page';
  if (str === 'Users') return 'User';

  // Standard singularization
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y';
  } else if (str.endsWith('es')) {
    return str.slice(0, -2);
  } else if (str.endsWith('s')) {
    return str.slice(0, -1);
  } else {
    return str;
  }
}
