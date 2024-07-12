const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker'); // Correct import for faker

const prisma = new PrismaClient();

const createFakeData = async () => {
    try {
        // Create fake users
        const users = [];
        for (let i = 0; i < 5; i++) {
            users.push({
                username: faker.internet.userName(),
                password: faker.internet.password(),
                isAdmin: faker.datatype.boolean(),
            });
        }

        const createdUsers = await prisma.users.createMany({
            data: users,
        });
        console.log(`${createdUsers.count} users created`);

        // Create fake categories
        const categories = [];
        for (let i = 0; i < 5; i++) {
            categories.push({
                name: faker.commerce.department(),
                photo: faker.image.imageUrl(),
            });
        }

        const createdCategories = await prisma.category.createMany({
            data: categories,
        });
        console.log(`${createdCategories.count} categories created`);

        // Create fake products
        const products = [];
        const categoriesList = await prisma.category.findMany();
        for (let i = 0; i < 20; i++) {
            const randomCategory = categoriesList[Math.floor(Math.random() * categoriesList.length)];
            products.push({
                name: faker.commerce.productName(),
                photo: faker.image.imageUrl(),
                price: faker.commerce.price(),
                categoryId: randomCategory.id,
            });
        }

        const createdProducts = await prisma.product.createMany({
            data: products,
        });
        console.log(`${createdProducts.count} products created`);

    } catch (error) {
        console.error("Error creating fake data: ", error);
    } finally {
        await prisma.$disconnect();
    }
};

createFakeData();
