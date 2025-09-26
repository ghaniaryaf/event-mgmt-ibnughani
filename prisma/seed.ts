import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create event categories
  const categories = await Promise.all([
    prisma.eventCategory.create({
      data: { name: 'Music Concert', description: 'Live music performances' }
    }),
    prisma.eventCategory.create({
      data: { name: 'Workshop', description: 'Educational workshops' }
    }),
    prisma.eventCategory.create({
      data: { name: 'Conference', description: 'Professional conferences' }
    })
  ]);

  // Create users (customers and organizers)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@example.com',
      password_hash: hashedPassword,
      full_name: 'Event Organizer',
      role: 'organizer',
      referral_code: 'ORG123'
    }
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      password_hash: hashedPassword,
      full_name: 'John Doe',
      role: 'customer',
      referral_code: 'CUST1'
    }
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      password_hash: hashedPassword,
      full_name: 'Jane Smith',
      role: 'customer',
      referral_code: 'CUST2'
    }
  });

  // Create coupon template for referral rewards
  const couponTemplate = await prisma.couponTemplate.create({
    data: {
      name: 'Referral Welcome Discount',
      description: '10% discount for new users via referral',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase_amount: 50000,
      max_discount_amount: 20000
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());