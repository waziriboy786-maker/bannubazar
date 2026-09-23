// Seed: admin account + initial category tree + a couple of clearly-fake
// sample shops/products for local development. No real personal data.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Men", "Women", "Kids", "Fashion", "Shoes", "Electronics", "Mobile Phones",
  "Mobile Accessories", "Computers", "Beauty", "Grocery", "Kitchen", "Home",
  "Furniture", "Watches", "Jewelry", "Sports", "Books", "Automotive", "Services", "Other",
];

async function main() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bannumarketplace.pk" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@bannumarketplace.pk",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Admin ready: ${admin.email} / Admin@12345 (change this immediately in a real deployment)`);

  for (const name of CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) await prisma.category.create({ data: { name } });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  // Sample verified seller + shop + a couple of products, for local dev only.
  const sellerUser = await prisma.user.upsert({
    where: { email: "demo.seller@bannumarketplace.pk" },
    update: {},
    create: {
      name: "Demo Seller",
      email: "demo.seller@bannumarketplace.pk",
      passwordHash: await bcrypt.hash("Seller@12345", 12),
      role: "SELLER",
    },
  });

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: { verificationStatus: "VERIFIED" },
    create: { userId: sellerUser.id, businessName: "Bannu General Store", verificationStatus: "VERIFIED" },
  });

  const shop = await prisma.shop.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      sellerId: sellerProfile.id,
      name: "Bannu General Store",
      description: "Everyday essentials, delivered locally in Bannu.",
      city: "Bannu",
      area: "Cantt Bazaar",
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      deliveryAvailable: true,
    },
  });

  const electronics = await prisma.category.findFirst({ where: { name: "Electronics" } });
  if (electronics) {
    await prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000101" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000101",
        sellerId: sellerProfile.id,
        shopId: shop.id,
        categoryId: electronics.id,
        name: "Sample Power Bank 10000mAh",
        description: "Demo product seeded for local development.",
        price: 2500,
        stockQuantity: 50,
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
