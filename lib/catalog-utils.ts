import Category from './db/models/category.model';
import SubCategory from './db/models/sub-category.model';
import Brand from './db/models/brand.model';
import Unit from './db/models/unit.model';


export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

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

export async function suggestCategories(query: string, industry: string, storeId?: string) {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    return await Category.find({
        industry,
        $and: [
            {
                $or: [
                    { isApproved: true },
                    ...(storeId ? [{ storeId }] : [])
                ]
            },
            {
                $or: [
                    { categoryName: { $regex: normalized, $options: 'i' } },
                    { categorySlug: { $regex: normalized, $options: 'i' } },
                    { synonyms: { $in: [new RegExp(normalized, 'i')] } }
                ]
            }
        ]
    }).limit(100).lean();
}

export async function suggestSubCategories(query: string, categoryId?: string, industry?: string, storeId?: string) {
    const baseFilter: any = {
        $or: [
            { isApproved: true },
            ...(storeId ? [{ storeId }] : [])
        ]
    };
    if (categoryId) baseFilter.parentCategory = categoryId;
    if (industry) baseFilter.industry = industry;

    if (!query || query.length < 2) {
        return await SubCategory.find(baseFilter).limit(100).lean();
    }

    const normalized = normalizeText(query);
    const finalFilter: any = {
        $and: [
            {
                $or: [
                    { isApproved: true },
                    ...(storeId ? [{ storeId }] : [])
                ]
            },
            {
                $or: [
                    { name: { $regex: normalized, $options: 'i' } },
                    { slug: { $regex: normalized, $options: 'i' } }
                ]
            }
        ]
    };
    if (categoryId) finalFilter.parentCategory = categoryId;
    if (industry) finalFilter.industry = industry;

    return await SubCategory.find(finalFilter).limit(100).lean();
}

export async function suggestBrands(query: string, industry: string, storeId?: string) {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    return await Brand.find({
        industry,
        $and: [
            {
                $or: [
                    { isApproved: true },
                    ...(storeId ? [{ storeId }] : [])
                ]
            },
            {
                $or: [
                    { name: { $regex: normalized, $options: 'i' } },
                    { slug: { $regex: normalized, $options: 'i' } },
                    { synonyms: { $in: [new RegExp(normalized, 'i')] } }
                ]
            }
        ]
    }).limit(100).lean();
}

export async function suggestUnits(query: string, industry: string = 'general', storeId?: string) {
    if (!query || query.length < 2) return [];

    const normalized = normalizeText(query);

    return await Unit.find({
        $and: [
            {
                $or: [
                    { isApproved: true },
                    ...(storeId ? [{ storeId }] : [])
                ]
            },
            {
                $or: [
                    { name: { $regex: normalized, $options: 'i' } },
                    { abbreviation: { $regex: normalized, $options: 'i' } }
                ]
            }
        ]
    }).limit(100).lean();
}
