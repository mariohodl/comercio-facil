import Category from './db/models/category.model';
import SubCategory from './db/models/sub-category.model';
import Brand from './db/models/brand.model';
import Unit from './db/models/unit.model';

/**
 * Normalizes a string for comparison by removing accents, 
 * converting to lowercase, and trimming.
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Finds an existing category using normalization and synonyms.
 */
export async function findNormalizedCategory(name: string, industry: string = 'general') {
    const normalized = normalizeText(name);

    return await Category.findOne({
        industry,
        isApproved: true,
        $or: [
            { categoryName: { $regex: new RegExp(`^${normalized}$`, 'i') } },
            { synonyms: normalized }
        ]
    });
}

/**
 * Finds an existing brand using normalization and synonyms.
 */
export async function findNormalizedBrand(name: string, industry: string = 'general') {
    const normalized = normalizeText(name);

    return await Brand.findOne({
        industry,
        isApproved: true,
        $or: [
            { name: { $regex: new RegExp(`^${normalized}$`, 'i') } },
            { synonyms: normalized }
        ]
    });
}

/**
 * Suggests categories based on user input.
 */
export async function suggestCategories(query: string, industry: string) {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    // Using regex for simple autocomplete if Atlas Search is not configured
    // For production, Atlas Search ($search) is recommended as per user request
    return await Category.find({
        industry,
        isApproved: true,
        $or: [
            { categoryName: { $regex: normalized, $options: 'i' } },
            { categorySlug: { $regex: normalized, $options: 'i' } },
            { synonyms: { $in: [new RegExp(normalized, 'i')] } }
        ]
    }).limit(100).lean();
}

/**
 * Suggests subcategories for a given category or industry.
 */
export async function suggestSubCategories(query: string, categoryId?: string, industry?: string) {
    if (!query || query.length < 2) {
        const filter: any = { isApproved: true };
        if (categoryId) filter.parentCategory = categoryId;
        if (industry) filter.industry = industry;
        return await SubCategory.find(filter).limit(100).lean();
    }

    const normalized = normalizeText(query);
    const filter: any = {
        isApproved: true,
        $or: [
            { name: { $regex: normalized, $options: 'i' } },
            { slug: { $regex: normalized, $options: 'i' } }
        ]
    };

    if (categoryId) filter.parentCategory = categoryId;
    if (industry) filter.industry = industry;

    return await SubCategory.find(filter).limit(100).lean();
}

/**
 * Suggests brands based on user input.
 */
export async function suggestBrands(query: string, industry: string) {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    return await Brand.find({
        industry,
        isApproved: true,
        $or: [
            { name: { $regex: normalized, $options: 'i' } },
            { slug: { $regex: normalized, $options: 'i' } },
            { synonyms: { $in: [new RegExp(normalized, 'i')] } }
        ]
    }).limit(100).lean();
}

/**
 * Suggests units based on user input.
 */
export async function suggestUnits(query: string, industry: string = 'general') {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    return await Unit.find({
        isApproved: true,
        $or: [
            { name: { $regex: normalized, $options: 'i' } },
            { abbreviation: { $regex: normalized, $options: 'i' } }
        ]
    }).limit(100).lean();
}
