/**
 * Per-category fiber durability estimates (PRD §6.4)
 * Maps keyword patterns to estimated standard wears.
 */

const CATEGORY_DURABILITY: [RegExp, number][] = [
    [/\b(tee|t-shirt|tank\s*top)\b/, 30],
    [/\b(linen\s+(shirt|blouse))\b/, 80],
    [/\b(shirt|blouse|button.?down)\b/, 50],
    [/\b(jeans|denim|pants?|trousers?|chinos?)\b/, 70],
    [/\b(jacket|coat|blazer|outerwear)\b/, 90],
    [/\b(sweater|knit|cardigan|pullover)\b/, 55],
    [/\b(skirt)\b/, 45],
    [/\b(dress)\b/, 45],
    [/\b(bag|purse|tote|backpack)\b/, 100],
    [/\b(flat|shoe|boot|sneaker|sandal|heel|loafer|mule)\b/, 60],
];

const DEFAULT_WEARS = 60;

export const DEFAULT_WEARS_PER_WEEK = 2;

/**
 * Returns estimated standard wears for a product based on keyword matching.
 * First match wins; falls back to 60 if no category matches.
 */
export function getStandardWears(query: string): number {
    const lower = query.toLowerCase();
    for (const [pattern, wears] of CATEGORY_DURABILITY) {
        if (pattern.test(lower)) return wears;
    }
    return DEFAULT_WEARS;
}
