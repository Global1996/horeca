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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
