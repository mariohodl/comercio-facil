import data from '@/lib/data';
import User from './models/user.model';
import Review from './models/review.model'
import { connectToDatabase } from '.';
import Product from './models/product.model';
import { cwd } from 'process';
import { loadEnvConfig } from '@next/env';
import { IReviewInput } from '@/types'
import Category from './models/category.model'
import Brand from './models/brand.model'
import Unit from './models/unit.model'
import SubCategory from './models/sub-category.model'
import { toSlug } from '../utils'

loadEnvConfig(cwd());

const main = async () => {
  try {
    const { products, reviews, users, categories, subCategories, brands, units } = data;
    await connectToDatabase(process.env.MONGODB_URI);

    await User.deleteMany();
    const createdUsers = await User.insertMany(users);

    // Seed brands
    await Brand.deleteMany();
    const brandsToInsert = brands.map((brand) => ({
      ...brand,
      slug: toSlug(brand.name),
    }));
    const createdBrands = await Brand.insertMany(brandsToInsert);

    // Seed units
    await Unit.deleteMany();
    const createdUnits = await Unit.insertMany(units);

    // Seed categories
    await Category.deleteMany();
    const createdCategories = await Category.insertMany(categories);

    // Seed sub-categories
    await SubCategory.deleteMany();
    const categoryMap = new Map(createdCategories.map((c) => [c.categoryName, c._id]));

    const subCategoriesToInsert = subCategories.map((sc) => {
      const parentId = categoryMap.get(sc.parentCategory);
      if (!parentId) {
        console.warn(`Parent category ${sc.parentCategory} not found for sub-category ${sc.name}`);
        return null;
      }
      return {
        ...sc,
        parentCategory: parentId,
      };
    }).filter(Boolean);

    const createdSubCategories = await SubCategory.insertMany(subCategoriesToInsert);

    await Product.deleteMany();
    const createdProducts = await Product.insertMany(products);

    await Review.deleteMany()
    const rws: IReviewInput[] = []
    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0
      const { ratingDistribution } = createdProducts[i]
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++
          rws.push({
            ...reviews.filter((x) => x.rating === j + 1)[
            x % reviews.filter((x) => x.rating === j + 1).length
            ],
            isVerifiedPurchase: true,
            product: createdProducts[i]._id,
            user: createdUsers[x % createdUsers.length]._id,
          })
        }
      }
    }
    const createdReviews = await Review.insertMany(rws);

    console.log({
      createdUsers,
      createdBrands,
      createdUnits,
      createdCategories,
      createdSubCategories,
      createdProducts,
      createdReviews,
      message: 'Seeded database successfully',
    });

    if (createdProducts.length > 0) {
      console.log('First product itemBarcode:', createdProducts[0].itemBarcode);
      console.log('First product full object:', JSON.stringify(createdProducts[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to seed database');
  }
};

main();
