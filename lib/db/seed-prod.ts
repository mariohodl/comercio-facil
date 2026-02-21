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

        const { categories, subCategories, brands, units, attributes } = data;

        console.log('Seeding Categories...');
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
        console.log(`✅ Seeded ${categoriesSeeded} categories.`);

        console.log('Seeding SubCategories...');
        // We need parent IDs for subcategories
        const allCategories = await Category.find({});
        const categoryMap = new Map();
        allCategories.forEach((c) => {
            // Map by name to match the data structure which uses parentCategory name
            categoryMap.set(c.categoryName, c._id);
        });

        let subCategoriesSeeded = 0;
        for (const subCat of subCategories) {
            const parentId = categoryMap.get(subCat.parentCategory);
            if (!parentId) {
                console.warn(`Parent category "${subCat.parentCategory}" not found for subcategory "${subCat.name}". Skipping.`);
                continue;
            }

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
        console.log(`✅ Seeded ${subCategoriesSeeded} subcategories.`);

        console.log('Seeding Brands...');
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
        console.log(`✅ Seeded ${brandsSeeded} brands.`);

        console.log('Seeding Units...');
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
        console.log(`✅ Seeded ${unitsSeeded} units.`);

        if (attributes && attributes.length > 0) {
            console.log('Seeding Attributes...');
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
            console.log(`✅ Seeded ${attributesSeeded} attributes.`);
        }

        console.log('🎉 PROD database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed PROD database:', error);
        process.exit(1);
    }
};

main();
