import './env-config';
import data from '@/lib/data';
import User from './models/user.model';
import Review from './models/review.model'
import { connectToDatabase } from '.';
import Product from './models/product.model';
import { cwd } from 'process';
import { IReviewInput } from '@/types'
import Category from './models/category.model'
import Brand from './models/brand.model'
import Unit from './models/unit.model'
import SubCategory from './models/sub-category.model'
import { toSlug } from '../utils'
import Attribute from './models/attribute.model'
import Company from './models/company.model'
import Store from './models/store.model'
import Warehouse from './models/warehouse.model'
import Customer from './models/customer.model'
import Order from './models/order.model'

const main = async () => {
  try {
    const { products, reviews, users, categories, subCategories, brands, units, attributes, customers } = data;
    await connectToDatabase(process.env.MONGODB_URI);

    await User.deleteMany();

    // Seed Companies, Stores, Warehouses
    await Company.deleteMany();
    await Store.deleteMany();
    await Warehouse.deleteMany();

    const { companies, stores, warehouses } = data;

    await User.deleteMany();
    const createdUsersInitial = await User.insertMany(users);
    const userMap = new Map(createdUsersInitial.map(u => [u.email, u._id]));

    const createdCompanies = await Company.insertMany(companies.map(c => {
      const ownerId = userMap.get(c.ownerEmail);
      if (!ownerId) {
        console.warn(`Owner with email ${c.ownerEmail} not found for company ${c.name}`);
        // Fallback to first user if specific owner not found, or skip
        return {
          ...c,
          owner: createdUsersInitial[0]._id,
          settings: { theme: 'light' }
        };
      }
      return {
        ...c,
        owner: ownerId,
        settings: { theme: 'light' }
      };
    }));
    const companyMap = new Map(createdCompanies.map(c => [c.name, c._id]));

    const storesToInsert = stores.map(s => ({
      ...s,
      company: companyMap.get(s.companyName)
    }));
    const createdStores = await Store.insertMany(storesToInsert);

    const warehousesToInsert = warehouses.map(w => ({
      ...w,
      company: companyMap.get(w.companyName)
    }));
    const createdWarehouses = await Warehouse.insertMany(warehousesToInsert);

    for (const user of createdUsersInitial) {
      const userData = users.find(u => u.email === user.email);
      const storeId = userData?.storeId;

      if (storeId) {
        const store = createdStores.find(s => s.slug === storeId);
        const companyId = store ? store.company : null;
        // Find warehouses for this company
        const companyWarehouses = createdWarehouses.filter(w => w.company.toString() === companyId?.toString());

        if (store && companyId) {
          await User.findByIdAndUpdate(user._id, {
            business: {
              companyId: companyId,
              stores: [store._id],
              warehouses: companyWarehouses.map(w => w._id),
              defaultStoreId: store._id
            },
            isStore: true
          });
        }
      }
    }

    // Reload users to return full objects
    const createdUsers = await User.find({});

    // Seed brands
    await Brand.deleteMany();
    const brandsToInsert = brands.map((brand) => ({
      ...brand,
      slug: toSlug(brand.name),
      storeId: createdStores[0].slug, // Default to first store
    }));
    const createdBrands = await Brand.insertMany(brandsToInsert);

    // Seed units
    await Unit.deleteMany();
    const unitsToInsert = units.map(unit => ({
      ...unit,
      storeId: createdStores[0].slug,
    }));
    const createdUnits = await Unit.insertMany(unitsToInsert);

    // Seed attributes
    await Attribute.deleteMany();
    const attributesToInsert = attributes.map(attr => ({
      ...attr,
      storeId: (attr as any).storeId || createdStores[0].slug,
      isGlobal: (attr as any).isGlobal ?? true,
      isApproved: (attr as any).isApproved ?? true,
      industry: (attr as any).industry || 'general'
    }));
    const createdAttributes = await Attribute.insertMany(attributesToInsert);

    // Seed categories
    await Category.deleteMany();
    const categoriesToInsert = categories.map(cat => ({
      ...cat,
      storeId: createdStores[0].slug,
    }));
    const createdCategories = await Category.insertMany(categoriesToInsert);

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
        storeId: createdStores[0].slug,
      };
    }).filter(Boolean);

    const createdSubCategories = await SubCategory.insertMany(subCategoriesToInsert);

    await Product.deleteMany();
    const createdProducts = await Product.insertMany(products);

    // Seed customers
    await Customer.deleteMany();

    const createdCustomers = await Customer.insertMany(customers);

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
      createdCustomers,
      createdCompanies,
      createdStores,
      createdWarehouses,
      createdBrands,
      createdUnits,
      createdAttributes,
      createdCategories,
      createdSubCategories,
      createdProducts,
      createdReviews,
      message: 'Seeded database successfully',
    });

    // Seed orders
    if (data.orders && data.orders.length > 0) {
      await Order.deleteMany();
      const ordersToInsert = data.orders.map((o: any) => {
        const user = createdUsers.find(u => u.email === o.userEmail);
        const product = createdProducts.find(p => p.slug === o.items[0].slug);

        return {
          user: user?._id || createdUsers[0]._id,
          storeId: o.storeId,
          items: o.items.map((item: any) => ({
            ...item,
            product: product?._id || createdProducts[0]._id,
            countInStock: product?.countInStock || 100,
            name: item.productName
          })),
          shippingAddress: {
            fullName: 'POS Customer',
            street: 'Store Pickup',
            city: 'Local',
            postalCode: '00000',
            country: 'Local',
            province: 'Local',
            phone: '0000000000',
          },
          fulfillmentType: 'IN_STORE',
          fulfillmentStatus: 'DELIVERED',
          paymentMethod: o.paymentMethod,
          itemsPrice: o.totalPrice,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: o.totalPrice,
          isPaid: o.isPaid,
          paidAt: o.isPaid ? o.createdAt : undefined,
          isDelivered: o.isDelivered,
          deliveredAt: o.isDelivered ? o.createdAt : undefined,
          expectedDeliveryDate: o.createdAt,
          createdAt: o.createdAt,
          updatedAt: o.createdAt
        };
      });
      await Order.insertMany(ordersToInsert);
      console.log('Seeded orders successfully');
    }

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
