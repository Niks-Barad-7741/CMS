/**
 * Shared ID generation utilities for Section/Block identifiers.
 * Used by:
 *  - Template application (Part 5: selectTemplate)
 *  - Pattern insertion (Part 7: instantiatePattern)
 *
 * Every application of a template or pattern MUST go through
 * cloneSectionsWithFreshIds() to get unique IDs — otherwise
 * two pages using the same template share identical IDs (a real bug).
 */

let idCounter = 0;

/**
 * Generates a unique ID with the given prefix.
 * Uses Date.now() + an incrementing counter to guarantee uniqueness
 * even when called multiple times in the same millisecond.
 */
export function genId(prefix: 'sec' | 'blk'): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/**
 * Deep-clones a single section with brand-new IDs on itself
 * and every block inside it. Style/content data is shallow-copied.
 */
export function cloneSectionWithFreshIds(section: any): any {
  return {
    ...section,
    id: genId('sec'),
    style: { ...section.style },
    blocks: (section.blocks || []).map((b: any) => ({
      ...b,
      id: genId('blk'),
      content: { ...b.content },
      style: { ...b.style }
    }))
  };
}

/**
 * Clones a full array of sections (used when applying a whole template).
 * Each section and block gets a fresh unique ID.
 */
export function cloneSectionsWithFreshIds(sections: any[]): any[] {
  return sections.map(cloneSectionWithFreshIds);
}
