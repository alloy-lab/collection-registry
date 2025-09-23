/**
 * Template Engine - Generates code from templates
 *
 * This utility provides template-based code generation for different
 * frameworks and use cases.
 */

import type { CollectionMetadata } from './fieldAnalyzer.js';

/**
 * Generate TypeScript interface for a collection
 */
export function generateCollectionType(collection: CollectionMetadata): string {
  const { displayName, fields } = collection;

  const fieldDefinitions = fields
    .map((field) => {
      const optional = field.required ? '' : '?';
      const type = getTypeScriptType(field.type);
      return `  ${field.name}${optional}: ${type};`;
    })
    .join('\n');

  return `export interface ${displayName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}`;
}

/**
 * Generate base types template
 */
export function generateBaseTypesTemplate(): string {
  return `/**
 * Base types for web app
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run collection-registry to regenerate
 */

// Base response type
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
}

// Query types
export interface QueryOptions {
  limit?: number;
  page?: number;
  where?: any;
  sort?: string;
  draft?: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  children?: NavigationItem[];
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

// Form types
export interface FormField {
  name: string;
  type: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FormSchema {
  fields: FormField[];
  validation?: any;
}
`;
}

/**
 * Generate base client template
 */
export function generateBaseClientTemplate(
  baseUrl: string = 'env.CMS_API_URL'
): string {
  return `/**
 * Base Payload client class
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run collection-registry to regenerate
 */

import { env } from '../env';
import type { PayloadResponse, QueryOptions } from '../types';

export abstract class BasePayloadClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = ${baseUrl};
  }

  protected async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  protected buildQueryParams(options?: QueryOptions): URLSearchParams {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return params;
  }
}`;
}

/**
 * Generate collection client methods
 */
export function generateCollectionClientMethods(
  collection: CollectionMetadata
): string {
  const { slug, displayName, pluralName, hasSlug, hasStatus, hasNavigation } =
    collection;

  const methods = [];

  // Get all items
  methods.push(`  /**
   * Get all ${pluralName.toLowerCase()} with optional filtering
   */
  async get${pluralName}(options?: QueryOptions): Promise<PayloadResponse<${displayName}>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<${displayName}>>(\`/${slug}?\${params.toString()}\`);
  }`);

  // Get single item by slug
  if (hasSlug) {
    methods.push(`  /**
   * Get a single ${displayName.toLowerCase()} by slug
   */
  async get${singularize(displayName)}(slug: string, draft = false): Promise<${displayName}> {
    const params = new URLSearchParams();
    if (draft) params.set('draft', 'true');

    const response = await this.fetch<PayloadResponse<${displayName}>>(
      \`/${slug}?where[slug][equals]=\${slug}&\${params.toString()}\`
    );

    if (response.docs.length === 0) {
      throw new Error(\`${displayName} with slug "\${slug}" not found\`);
    }

    return response.docs[0];
  }`);
  }

  // Get published items
  if (hasStatus) {
    methods.push(`  /**
   * Get only published ${pluralName.toLowerCase()}
   */
  async getPublished${pluralName}(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }`);
  }

  // Get navigation items
  if (hasNavigation) {
    methods.push(`  /**
   * Get ${pluralName.toLowerCase()} for navigation menu
   */
  async get${pluralName}ForNavigation(): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      where: {
        showInNavigation: { equals: true },
        status: { equals: 'published' },
      },
      sort: 'navigationOrder',
    });
    return response.docs;
  }`);
  }

  return methods.join('\n\n');
}

/**
 * Generate React Router route template
 */
export function generateRouteTemplate(
  collection: CollectionMetadata,
  type: 'index' | 'detail'
): string {
  const { slug, displayName, pluralName } = collection;

  if (type === 'index') {
    return `import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { ${displayName} } from '~/lib/types';

export const meta: MetaFunction = () => {
  return [
    { title: \`${pluralName} - My App\` },
    { name: 'description', content: \`Browse all ${pluralName.toLowerCase()}\` },
  ];
};

export async function loader() {
  try {
    const ${slug} = await payloadClient.getPublished${pluralName}();
    return { ${slug} };
  } catch (error) {
    console.error(\`Error loading ${pluralName.toLowerCase()}:\`, error);
    return { ${slug}: [] };
  }
}

export default function ${pluralName}Index({ loaderData }: { loaderData: { ${slug}: ${displayName}[] } }) {
  const { ${slug} } = loaderData;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>${pluralName}</h1>

      {${slug}.length === 0 ? (
        <p className='text-gray-600'>No ${pluralName.toLowerCase()} found.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {${slug}.map((${slug.slice(0, -1)}) => (
            <div key={${slug.slice(0, -1)}.id} className='bg-white rounded-lg shadow-md overflow-hidden'>
              {${slug.slice(0, -1)}.featuredImage && (
                <img
                  src={${slug.slice(0, -1)}.featuredImage.url}
                  alt={${slug.slice(0, -1)}.featuredImage.alt || ${slug.slice(0, -1)}.title}
                  className='w-full h-48 object-cover'
                />
              )}
              <div className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  <a href={\`/${slug}/\${${slug.slice(0, -1)}.slug}\`} className='hover:text-blue-600'>
                    {${slug.slice(0, -1)}.title}
                  </a>
                </h2>
                {${slug.slice(0, -1)}.excerpt && (
                  <p className='text-gray-600 mb-4'>{${slug.slice(0, -1)}.excerpt}</p>
                )}
                <div className='text-sm text-gray-500'>
                  {new Date(${slug.slice(0, -1)}.publishedDate || ${slug.slice(0, -1)}.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;
  }

  if (type === 'detail') {
    return `import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { ${displayName} } from '~/lib/types';

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData || !(loaderData as any)?.${slug.slice(0, -1)}) {
    return [
      { title: 'Not Found' },
      { name: 'description', content: '${displayName} not found' },
    ];
  }

  const ${slug.slice(0, -1)} = (loaderData as any).${slug.slice(0, -1)};
  return [
    { title: \`\${${slug.slice(0, -1)}.title} - My App\` },
    { name: 'description', content: ${slug.slice(0, -1)}.excerpt || ${slug.slice(0, -1)}.seo?.description || 'Read more' },
  ];
};

export async function loader({ params }: { params: { slug: string } }) {
  try {
    const ${slug.slice(0, -1)} = await payloadClient.get${singularize(displayName)}(params.slug);
    return { ${slug.slice(0, -1)} };
  } catch (error) {
    console.error(\`Error loading ${displayName.toLowerCase()}:\`, error);
    throw new Response('Not Found', { status: 404 });
  }
}

export default function ${displayName}Detail({ loaderData }: { loaderData: { ${slug.slice(0, -1)}: ${displayName} } }) {
  const { ${slug.slice(0, -1)} } = loaderData;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <article className='prose prose-lg max-w-none'>
        {${slug.slice(0, -1)}.featuredImage && (
          <img
            src={${slug.slice(0, -1)}.featuredImage.url}
            alt={${slug.slice(0, -1)}.featuredImage.alt || ${slug.slice(0, -1)}.title}
            className='w-full h-64 object-cover rounded-lg mb-8'
          />
        )}

        <h1 className='text-4xl font-bold text-gray-900 mb-4'>{${slug.slice(0, -1)}.title}</h1>

        {${slug.slice(0, -1)}.excerpt && (
          <p className='text-xl text-gray-600 mb-8'>{${slug.slice(0, -1)}.excerpt}</p>
        )}

        <div className='prose prose-lg max-w-none'>
          {/* Rich text content would be rendered here */}
          <div dangerouslySetInnerHTML={{ __html: 'Rich text content rendering needed' }} />
        </div>

        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='text-sm text-gray-500'>
            Published: {new Date(${slug.slice(0, -1)}.publishedDate || ${slug.slice(0, -1)}.createdAt).toLocaleDateString()}
          </div>
        </div>
      </article>
    </div>
  );
}`;
  }

  return '';
}

// Import utility functions
import { getTypeScriptType, singularize } from './fieldAnalyzer.js';
