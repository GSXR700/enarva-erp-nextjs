import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCompanyInfo() {
  try {
    // Delete any existing CompanyInfo records that might be causing issues
    await prisma.companyInfo.deleteMany({});

    // Create a new CompanyInfo record with all required fields
    const newCompanyInfo = await prisma.companyInfo.create({
      data: {
        companyName: "Enarva SARL AU",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('Successfully created new CompanyInfo:', newCompanyInfo);
  } catch (error) {
    console.error('Error fixing CompanyInfo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompanyInfo();
