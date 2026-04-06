import { FIBER_ALIASES } from "../config/fiberData";

const normalizeCandidate = (value: string): string =>
  value.toLowerCase().replace(/[^a-z/\s-]/g, " ").replace(/\s+/g, " ").trim();

const canonicalizeFiber = (value: string): string | null => {
  const normalized = normalizeCandidate(value);

  for (const [canonical, aliases] of Object.entries(FIBER_ALIASES)) {
    for (const alias of aliases) {
      const pattern = new RegExp(
        `\\b${alias
          .replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
          .replace(/\s+/g, "\\\\s+")}\\b`,
        "i"
      );
      if (pattern.test(normalized)) {
        return canonical;
      }
    }
  }

  return null;
};

const clampPct = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

export const parseFiberComposition = (rawText: string): Record<string, number> => {
  const text = rawText.toLowerCase();

  // Handle structured formats like "shell: 100% cotton, lining: 100% polyester"
  const structuredMatches = text.match(/(\w+):\s*([^,]+)(?:,|$)/g);
  if (structuredMatches) {
    const composition: Record<string, number> = {};
    for (const match of structuredMatches) {
      const [, , content] = match.match(/(\w+):\s*(.+)/) || [];
      if (content) {
        const subComposition = parseSimpleComposition(content);
        Object.assign(composition, subComposition);
      }
    }
    return composition;
  }

  return parseSimpleComposition(text);
};

const parseSimpleComposition = (text: string): Record<string, number> => {
  const segments = text
    .split(/[\n;,|]+/)
    .map((segment) => normalizeCandidate(segment))
    .filter(Boolean);

  const composition: Record<string, number> = {};

  for (const segment of segments) {
    // Enhanced regex patterns to handle more formats
    const patterns = [
      // Standard: "100% cotton", "50 % cotton"
      /(\d{1,3}(?:\.\d+)?)\s*%\s*([a-z][a-z\s/-]{1,50})/i,
      // Reverse: "cotton 100%", "cotton 50 %"
      /([a-z][a-z\s/-]{1,50})\s*(\d{1,3}(?:\.\d+)?)\s*%/i,
      // No percent: "100 cotton", "cotton 100"
      /(\d{1,3}(?:\.\d+)?)\s+([a-z][a-z\s/-]{1,50})/i,
      /([a-z][a-z\s/-]{1,50})\s+(\d{1,3}(?:\.\d+)?)/i,
      // Word-based: "one hundred percent cotton"
      /(?:one\s+hundred|100)\s*percent?\s*([a-z][a-z\s/-]{1,50})/i,
      /([a-z][a-z\s/-]{1,50})\s+(?:one\s+hundred|100)\s*percent?/i
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = segment.match(pattern);
      if (match) {
        const value = match[1]?.match(/\d/) ? match[1] : match[2];
        const name = match[1]?.match(/\d/) ? match[2] : match[1];

        if (value && name) {
          const canonical = canonicalizeFiber(name);
          if (canonical) {
            const pct = clampPct(Number(value));
            if (pct > 0) {
              composition[canonical] = (composition[canonical] ?? 0) + pct;
              matched = true;
              break;
            }
          }
        }
      }
    }

    // If no percentage found, try to identify fiber without percentage
    if (!matched) {
      const canonical = canonicalizeFiber(segment);
      if (canonical && !composition[canonical]) {
        // Assume 100% if it's the only fiber mentioned
        const fiberCount = Object.keys(composition).length;
        if (fiberCount === 0) {
          composition[canonical] = 100;
        }
      }
    }
  }

  return composition;
};

export const normalizeFiberComposition = (
  composition: Record<string, number>
): Record<string, number> => {
  const entries = Object.entries(composition).filter(([, pct]) => pct > 0);
  const total = entries.reduce((sum, [, pct]) => sum + pct, 0);

  if (!entries.length || total === 0) {
    return {};
  }

  if (total <= 100) {
    return Object.fromEntries(entries.map(([fiber, pct]) => [fiber, Number(pct.toFixed(2))]));
  }

  return Object.fromEntries(
    entries.map(([fiber, pct]) => [fiber, Number(((pct / total) * 100).toFixed(2))])
  );
};
