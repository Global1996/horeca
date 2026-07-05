import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BUSINESS_EMAIL;
  const password = process.env.BUSINESS_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Setează BUSINESS_EMAIL și BUSINESS_PASSWORD în .env înainte de a rula seed-ul."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: { email, password: hashedPassword },
  });

  console.log(`Cont de business pregătit: ${user.email}`);

  const existingBusiness = await prisma.business.findFirst({
    where: { name: "Cafeneaua Test" },
  });

  if (existingBusiness) {
    console.log(
      `Datele demo pentru "${existingBusiness.name}" există deja, sar peste.`
    );
    return;
  }

  const business = await prisma.business.create({
    data: {
      name: "Cafeneaua Test",
      type: "cafenea",
      cui: "RO12345678",
    },
  });

  const [supplierCafea, supplierLactatePanificatie] = await Promise.all([
    prisma.supplier.create({
      data: {
        businessId: business.id,
        name: "Furnizor Cafea SRL",
        contact: "Andrei Popescu",
        phone: "0722111222",
      },
    }),
    prisma.supplier.create({
      data: {
        businessId: business.id,
        name: "Distribuitor Lactate & Panificație SRL",
        contact: "Maria Ionescu",
        phone: "0733444555",
      },
    }),
  ]);

  await prisma.ingredient.createMany({
    data: [
      {
        businessId: business.id,
        name: "Cafea boabe",
        category: "non_perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 5000,
        minThreshold: 1000,
        vatRate: 9,
        supplierId: supplierCafea.id,
      },
      {
        businessId: business.id,
        name: "Lapte",
        category: "perisabil",
        purchaseUnit: "L",
        usageUnit: "ml",
        conversionRate: 1000,
        currentStock: 20000,
        minThreshold: 5000,
        vatRate: 9,
        supplierId: supplierLactatePanificatie.id,
      },
      {
        businessId: business.id,
        name: "Făină",
        category: "non_perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 10000,
        minThreshold: 2000,
        vatRate: 9,
        supplierId: supplierLactatePanificatie.id,
      },
      {
        businessId: business.id,
        name: "Piept de pui",
        category: "perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 5000,
        minThreshold: 1000,
        vatRate: 9,
      },
      {
        businessId: business.id,
        name: "Roșii",
        category: "perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 3000,
        minThreshold: 500,
        vatRate: 9,
      },
      {
        businessId: business.id,
        name: "Ulei de floarea-soarelui",
        category: "semi_perisabil",
        purchaseUnit: "L",
        usageUnit: "ml",
        conversionRate: 1000,
        currentStock: 5000,
        minThreshold: 1000,
        vatRate: 9,
      },
      {
        businessId: business.id,
        name: "Zahăr",
        category: "non_perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 8000,
        minThreshold: 2000,
        vatRate: 9,
      },
      {
        businessId: business.id,
        name: "Ouă",
        category: "perisabil",
        purchaseUnit: "buc",
        usageUnit: "buc",
        conversionRate: 1,
        currentStock: 60,
        minThreshold: 12,
        vatRate: 9,
      },
      {
        businessId: business.id,
        name: "Unt",
        category: "perisabil",
        purchaseUnit: "kg",
        usageUnit: "g",
        conversionRate: 1000,
        currentStock: 3000,
        minThreshold: 500,
        vatRate: 9,
        supplierId: supplierLactatePanificatie.id,
      },
      {
        businessId: business.id,
        name: "Sirop de cacao",
        category: "semi_perisabil",
        purchaseUnit: "L",
        usageUnit: "ml",
        conversionRate: 1000,
        currentStock: 2000,
        minThreshold: 500,
        vatRate: 9,
        supplierId: supplierCafea.id,
      },
    ],
  });

  await prisma.employee.createMany({
    data: [
      {
        businessId: business.id,
        name: "Ana Marinescu",
        role: "barista",
      },
      {
        businessId: business.id,
        name: "Radu Stancu",
        role: "bucatar",
      },
      {
        businessId: business.id,
        name: "Elena Dumitrescu",
        role: "manager",
      },
    ],
  });

  console.log(`Date demo create pentru "${business.name}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
