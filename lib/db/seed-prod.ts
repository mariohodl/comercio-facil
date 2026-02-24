import './env-config';
import data from '@/lib/data';
import { connectToDatabase } from '.';
import Category from './models/category.model';
import Brand from './models/brand.model';
import Unit from './models/unit.model';
import SubCategory from './models/sub-category.model';
import Attribute from './models/attribute.model';
import { toSlug } from '../utils';

const main = async () => {
    try {
        console.log('Starting PROD seeding process...');
        const mongoUri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('Please define the MONGODB_URI or MONGODB_URI_PROD environment variable inside .env.local');
        }
        await connectToDatabase(mongoUri);

        const { categories, subCategories, brands, units, attributes, globalCatalog } = data;

        // --- Seed from globalCatalog (Industry-specific) ---
        if (globalCatalog && globalCatalog.length > 0) {
            console.log('Seeding from Global Catalog...');
            for (const item of globalCatalog) {
                const { industry, categories: industryCategories } = item;
                console.log(`Processing industry: ${industry}...`);

                for (const catData of industryCategories) {
                    const categorySlug = toSlug(catData.name);
                    const categoryResult = await Category.findOneAndUpdate(
                        { categoryName: catData.name, industry: industry },
                        {
                            $set: {
                                categorySlug,
                                industry,
                                isGlobal: true,
                                isApproved: true,
                                status: true
                            }
                        },
                        { upsert: true, new: true }
                    );

                    for (const subName of catData.subcategories) {
                        const subSlug = toSlug(subName);
                        await SubCategory.updateOne(
                            { name: subName, parentCategory: categoryResult._id },
                            {
                                $set: {
                                    slug: subSlug,
                                    parentCategory: categoryResult._id,
                                    industry,
                                    isGlobal: true,
                                    isApproved: true,
                                    status: true
                                }
                            },
                            { upsert: true }
                        );
                    }

                    for (const brandName of catData.brands) {
                        const brandSlug = toSlug(brandName);
                        await Brand.updateOne(
                            { name: brandName, industry: industry },
                            {
                                $set: {
                                    slug: brandSlug,
                                    industry,
                                    isGlobal: true,
                                    isApproved: true,
                                    status: true
                                }
                            },
                            { upsert: true }
                        );
                    }

                    for (const unitData of catData.units) {
                        const uName = typeof unitData === 'string' ? unitData : unitData.name;
                        const uAbbr = typeof unitData === 'string' ? toSlug(unitData).substring(0, 3) : unitData.abbreviation;

                        await Unit.updateOne(
                            { name: uName, industry: industry },
                            {
                                $set: {
                                    abbreviation: uAbbr,
                                    industry,
                                    isGlobal: true,
                                    isApproved: true,
                                    status: true
                                }
                            },
                            { upsert: true }
                        );
                    }
                }
            }
            console.log('✅ Global Catalog seeded.');
        }

        // --- Original Seeding (General) ---
        console.log('Seeding General Categories...');
        let categoriesSeeded = 0;
        for (const cat of categories) {
            await Category.updateOne(
                { categorySlug: cat.categorySlug },
                {
                    $set: {
                        categoryName: cat.categoryName,
                        status: cat.status,
                        isGlobal: true,
                        isApproved: true,
                    },
                    $setOnInsert: {
                        industry: 'general',
                        usageCount: 0,
                        synonyms: [],
                    },
                },
                { upsert: true }
            );
            categoriesSeeded++;
        }
        console.log(`✅ Seeded ${categoriesSeeded} general categories.`);

        console.log('Seeding General SubCategories...');
        const allCategories = await Category.find({});
        const categoryMap = new Map();
        allCategories.forEach((c) => {
            categoryMap.set(c.categoryName, c._id);
        });

        let subCategoriesSeeded = 0;
        for (const subCat of subCategories) {
            const parentId = categoryMap.get(subCat.parentCategory);
            if (!parentId) continue;

            await SubCategory.updateOne(
                { slug: subCat.slug },
                {
                    $set: {
                        name: subCat.name,
                        parentCategory: parentId,
                        code: subCat.code,
                        status: subCat.status,
                        isGlobal: true,
                        isApproved: true,
                    },
                    $setOnInsert: {
                        industry: 'general',
                        usageCount: 0,
                        synonyms: [],
                    },
                },
                { upsert: true }
            );
            subCategoriesSeeded++;
        }
        console.log(`✅ Seeded ${subCategoriesSeeded} general subcategories.`);

        console.log('Seeding General Brands...');
        let brandsSeeded = 0;
        for (const brand of brands) {
            const slug = toSlug(brand.name);
            await Brand.updateOne(
                { slug: slug },
                {
                    $set: {
                        name: brand.name,
                        status: brand.status,
                        isGlobal: true,
                        isApproved: true,
                    },
                    $setOnInsert: {
                        industry: 'general',
                        usageCount: 0,
                        synonyms: [],
                    },
                },
                { upsert: true }
            );
            brandsSeeded++;
        }
        console.log(`✅ Seeded ${brandsSeeded} general brands.`);

        console.log('Seeding General Units...');
        let unitsSeeded = 0;
        for (const unit of units) {
            await Unit.updateOne(
                { name: unit.name },
                {
                    $set: {
                        abbreviation: unit.abbreviation,
                        status: unit.status,
                        isGlobal: true,
                        isApproved: true,
                    },
                    $setOnInsert: {
                        industry: 'general',
                        usageCount: 0,
                        synonyms: [],
                    },
                },
                { upsert: true }
            );
            unitsSeeded++;
        }
        console.log(`✅ Seeded ${unitsSeeded} general units.`);

        if (attributes && attributes.length > 0) {
            console.log('Seeding General Attributes...');
            let attributesSeeded = 0;
            for (const attr of attributes as any[]) {
                await Attribute.updateOne(
                    { name: attr.name },
                    {
                        $set: {
                            type: attr.type,
                            options: attr.options,
                            isGlobal: true,
                            isApproved: true,
                        },
                        $setOnInsert: {
                            industry: attr.industry || 'general',
                        },
                    },
                    { upsert: true }
                );
                attributesSeeded++;
            }
            console.log(`✅ Seeded ${attributesSeeded} general attributes.`);
        }

        console.log('🎉 PROD database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed PROD database:', error);
        process.exit(1);
    }
};

main();
