'use server'

import { connectToDatabase } from '@/lib/db';
import Category from '@/lib/db/models/category.model';
import SubCategory from '@/lib/db/models/sub-category.model';
import Brand from '@/lib/db/models/brand.model';
import Unit from '@/lib/db/models/unit.model';
import data, { globalCatalog } from '@/lib/data';
import { normalizeText } from '@/lib/catalog-utils';


export async function seedGlobalCatalog() {
    try {
        await connectToDatabase();

        const results = {
            categories: 0,
            subcategories: 0,
            brands: 0,
            units: 0
        };

        for (const item of globalCatalog) {
            const { industry, categories } = item;

            for (const catData of categories) {
                let category = await Category.findOne({
                    categoryName: { $regex: new RegExp(`^${catData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                    industry,
                    isGlobal: true
                });

                try {
                    if (!category) {
                        category = await Category.create({
                            categoryName: catData.name,
                            categorySlug: normalizeText(catData.name).replace(/\s+/g, '-'),
                            industry,
                            isGlobal: true,
                            isApproved: true,
                            status: true
                        });
                        results.categories++;
                    }
                } catch (error) {
                    // console.error(`Skipping category ${catData.name} due to error:`, error);
                    continue; // Skip subcategories if category doesn't exist/can't be created
                }

                // Upsert Subcategories
                for (const subName of catData.subcategories) {
                    const subExists = await SubCategory.findOne({
                        name: { $regex: new RegExp(`^${subName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                        parentCategory: category._id,
                        industry
                    });

                    try {
                        if (!subExists) {
                            await SubCategory.create({
                                name: subName,
                                slug: normalizeText(subName).replace(/\s+/g, '-'),
                                parentCategory: category._id,
                                industry,
                                isGlobal: true,
                                isApproved: true,
                                code: normalizeText(subName).substring(0, 3).toUpperCase(),
                                status: true
                            });
                            results.subcategories++;
                        }
                    } catch (error) {
                        // console.error(`Skipping subcategory ${subName} due to error:`, error);
                    }
                }

                // Upsert Brands (Industry wide or General)
                for (const brandName of catData.brands) {
                    // Check if exists in this industry OR in general (Case-insensitive search with actual name)
                    const brandExists = await Brand.findOne({
                        name: { $regex: new RegExp(`^${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                        $or: [{ industry }, { industry: 'general' }]
                    });
                    try {
                        if (!brandExists) {
                            await Brand.create({
                                name: brandName,
                                slug: normalizeText(brandName).replace(/\s+/g, '-'),
                                industry: industry === 'general' ? 'general' : industry,
                                isGlobal: true,
                                isApproved: true,
                                status: true
                            });
                            results.brands++;
                        }
                    } catch (error) {
                        // console.error(`Skipping brand ${brandName} due to error:`, error);
                    }
                }

                // Upsert Units (Industry wide or General)
                for (const unit of catData.units) {
                    let unitName = '';
                    let unitAbbrev = '';
                    let unitStatus = true;

                    if (typeof unit === 'string') {
                        unitName = unit;
                        unitAbbrev = unit.substring(0, 3).toLowerCase();
                    } else {
                        unitName = unit.name;
                        unitAbbrev = unit.abbreviation;
                        unitStatus = unit.status;
                    }

                    // Units are mostly universal (Case-insensitive search with actual name)
                    const unitExists = await Unit.findOne({
                        $or: [
                            { name: { $regex: new RegExp(`^${unitName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                            { abbreviation: { $regex: new RegExp(`^${unitAbbrev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
                        ],
                        isGlobal: true
                    });
                    try {
                        if (!unitExists) {
                            await Unit.create({
                                name: unitName,
                                abbreviation: unitAbbrev,
                                industry: 'general', // Units should ideally be general
                                isGlobal: true,
                                isApproved: true,
                                status: unitStatus
                            });
                            results.units++;
                        }
                    } catch (error) {
                        // console.error(`Skipping unit ${unitName} due to error:`, error);
                    }
                }
            }
        }

        // Seed Units from data.ts
        if (data && data.units) {
            for (const unit of data.units) {
                const unitExists = await Unit.findOne({
                    $or: [
                        { name: { $regex: new RegExp(`^${unit.name}$`, 'i') } },
                        { abbreviation: { $regex: new RegExp(`^${unit.abbreviation}$`, 'i') } }
                    ],
                    isGlobal: true
                });

                try {
                    if (!unitExists) {
                        await Unit.create({
                            name: unit.name,
                            abbreviation: unit.abbreviation,
                            industry: 'general',
                            isGlobal: true,
                            isApproved: true,
                            status: unit.status
                        });
                        results.units++;
                    }
                } catch (error) {
                    console.error(`Skipping unit ${unit.name} due to error:`, error);
                }
            }
        }

        // Automatically consolidate after seeding to clean up industrial overlaps
        const consolidation = await consolidateGlobalCatalog();

        return {
            success: true,
            message: 'Catalog seeded and consolidated successfully',
            results,
            consolidation: consolidation.success ? consolidation.report : null
        };
    } catch (error: any) {
        // console.error('Error seeding global catalog:', error);
        return { success: false, error: error.message };
    }
}

export async function consolidateGlobalCatalog() {
    try {
        await connectToDatabase();

        const report = {
            unitsDeleted: 0,
            brandsDeleted: 0,
            categoriesDeleted: 0
        };

        // Consolidate Units (Units are very prone to duplication like "Botella")
        const unitDuplicates = await Unit.aggregate([
            { $match: { isGlobal: true } },
            {
                $group: {
                    _id: { $toLower: "$name" },
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        for (const duplicate of unitDuplicates) {
            const [keepId, ...deleteIds] = duplicate.ids;
            await Unit.deleteMany({ _id: { $in: deleteIds } });
            report.unitsDeleted += deleteIds.length;
        }

        // Consolidate Brands
        const brandDuplicates = await Brand.aggregate([
            { $match: { isGlobal: true } },
            {
                $group: {
                    _id: { $toLower: "$name" },
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        for (const duplicate of brandDuplicates) {
            const [keepId, ...deleteIds] = duplicate.ids;
            await Brand.deleteMany({ _id: { $in: deleteIds } });
            report.brandsDeleted += deleteIds.length;
        }

        return { success: true, report };
    } catch (error: any) {
        // console.error('Consolidation error:', error);
        return { success: false, error: error.message };
    }
}

// Server action to get suggestions for the UI.
export async function getCategorySuggestions(query: string, industry: string = 'general') {
    try {
        await connectToDatabase();
        const { suggestCategories } = await import('@/lib/catalog-utils');
        const suggestions = await suggestCategories(query, industry);
        return { success: true, suggestions: JSON.parse(JSON.stringify(suggestions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBrandSuggestions(query: string, industry: string = 'general') {
    try {
        await connectToDatabase();
        const { suggestBrands } = await import('@/lib/catalog-utils');
        const suggestions = await suggestBrands(query, industry);
        return { success: true, suggestions: JSON.parse(JSON.stringify(suggestions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSubCategorySuggestions(query: string, categoryId?: string, industry?: string) {
    try {
        await connectToDatabase();
        const { suggestSubCategories } = await import('@/lib/catalog-utils');
        const suggestions = await suggestSubCategories(query, categoryId, industry);
        return { success: true, suggestions: JSON.parse(JSON.stringify(suggestions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUnitSuggestions(query: string, industry: string = 'general') {
    try {
        await connectToDatabase();
        const { suggestUnits } = await import('@/lib/catalog-utils');
        const suggestions = await suggestUnits(query, industry);
        return { success: true, suggestions: JSON.parse(JSON.stringify(suggestions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCompanyIndustry() {
    try {
        const { auth } = await import('@/auth');
        const session = await auth();
        if (!session?.user?.email) return 'general';

        await connectToDatabase();
        const User = (await import('@/lib/db/models/user.model')).default;
        const Company = (await import('@/lib/db/models/company.model')).default;

        const user = await User.findOne({ email: session.user.email }).populate('business.companyId');
        return (user as any)?.business?.companyId?.industry || 'general';
    } catch (error) {
        // console.error(error);
        return 'general';
    }
}
