import { PRODUCTS, CatalogItem } from "@/data/products";

export type QualityTier = "economy" | "standard" | "premium";

export interface ScopeDef {
  id: string;
  /** product category names (from CSV) used to pick sample products & avg pricing */
  categories: string[];
  /** Standard tier base rate in EGP / m² */
  rate: number;
}

/** Workscope catalog — base rates calibrated for Egyptian luxury finishing market */
export const SCOPES: ScopeDef[] = [
  { id: "structural", categories: ["Construction"], rate: 850 },
  { id: "electrical", categories: ["Electrical", "Electricity"], rate: 650 },
  { id: "plumbing", categories: ["Plumbing"], rate: 520 },
  { id: "paint", categories: ["Painting"], rate: 380 },
  { id: "gypsum", categories: ["Gypsum"], rate: 460 },
  { id: "flooring", categories: ["Flooring", "Marble"], rate: 1150 },
  { id: "carpentry", categories: ["Carpentry", "Wooden Units", "Fitout"], rate: 1850 },
  { id: "doors_glass", categories: ["Architectural", "Glass", "Metal"], rate: 420 },
];

export const PROPERTY_TYPES = ["apartment", "villa", "duplex", "penthouse", "townhouse", "studio"] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

export const PROPERTY_MULT: Record<PropertyType, number> = {
  apartment: 1.0,
  villa: 1.18,
  duplex: 1.08,
  penthouse: 1.28,
  townhouse: 1.12,
  studio: 0.92,
};

export const TIER_MULT: Record<QualityTier, number> = {
  economy: 0.72,
  standard: 1.0,
  premium: 1.55,
};

export interface ScopeLine {
  id: string;
  rate: number;
  cost: number;
  samples: CatalogItem[];
}

export interface EstimateResult {
  subtotal: number;
  min: number;
  max: number;
  lines: ScopeLine[];
  pricePerSqm: number;
}

/** Pick representative products from a category for transparency */
export function sampleByCategories(cats: string[], n = 6): CatalogItem[] {
  const pool = PRODUCTS.filter((p) => cats.includes(p.c) && p.p > 0);
  // sort by middle of price range to get representative items
  pool.sort((a, b) => a.p - b.p);
  if (pool.length <= n) return pool;
  const step = Math.floor(pool.length / n);
  const picks: CatalogItem[] = [];
  for (let i = 0; i < n; i++) picks.push(pool[Math.min(i * step, pool.length - 1)]);
  return picks;
}

export function calculateEstimate(opts: {
  area: number;
  propertyType: PropertyType;
  floors: number;
  tier: QualityTier;
  scopes: string[];
  /** ±range as a fraction (0-1). Default 0.15 */
  range?: number;
}): EstimateResult {
  const range = opts.range ?? 0.15;
  const propMult = PROPERTY_MULT[opts.propertyType] ?? 1;
  const tierMult = TIER_MULT[opts.tier] ?? 1;
  const floorsMult = 1 + Math.max(0, opts.floors - 1) * 0.08;
  const area = Math.max(0, opts.area);

  const lines: ScopeLine[] = opts.scopes
    .map((id) => SCOPES.find((s) => s.id === id))
    .filter((s): s is ScopeDef => Boolean(s))
    .map((s) => {
      const cost = Math.round(s.rate * area * propMult * tierMult * floorsMult);
      return {
        id: s.id,
        rate: Math.round(s.rate * propMult * tierMult * floorsMult),
        cost,
        samples: sampleByCategories(s.categories, 5),
      };
    });

  const subtotal = lines.reduce((sum, l) => sum + l.cost, 0);
  return {
    subtotal,
    min: Math.round(subtotal * (1 - range)),
    max: Math.round(subtotal * (1 + range)),
    pricePerSqm: area > 0 ? Math.round(subtotal / area) : 0,
    lines,
  };
}

export function formatEGP(value: number, lang: "ar" | "en" = "en"): string {
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
    maximumFractionDigits: 0,
  }).format(value);
  return lang === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}
