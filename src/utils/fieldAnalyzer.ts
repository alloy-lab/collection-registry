/**
 * Field Analyzer - Analyzes Payload collection fields
 *
 * This utility extracts and analyzes field metadata from Payload collection files
 * to generate appropriate TypeScript types and API client methods.
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
