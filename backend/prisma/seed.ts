import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- STARTING DATABASE SEEDING ---');
  const filePath = path.join(__dirname, 'cards-raw.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Raw cards data file not found at ${filePath}. Please run the crawler script first.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards = JSON.parse(rawData);

  console.log(`Loaded ${cards.length} cards from raw data file.`);

  let successCount = 0;
  for (const card of cards) {
    try {
      // Map and clean fields to fit model schema
      // Since SQLite JSON fields are mapped to JSON type in Prisma, we can pass them as objects
      await prisma.card.upsert({
        where: { slug: card.slug },
        update: {
          arcanaType: card.arcanaType,
          suit: card.suit,
          number: card.number,
          nameEn: card.nameEn,
          nameVi: card.nameVi,
          imageUrl: card.imageUrl.replace('.webp', '.png'),
          keywords: card.keywords,
          actionGroups: card.actionGroups,
          quickMeaning: card.quickMeaning,
          detailedDescription: card.detailedDescription,
          uprightMeaning: card.uprightMeaning,
          reversedMeaning: card.reversedMeaning,
          opposingCardSlugs: card.opposingCardSlugs,
          supportingCardSlugs: card.supportingCardSlugs,
          sourceUrl: card.sourceUrl,
        },
        create: {
          slug: card.slug,
          arcanaType: card.arcanaType,
          suit: card.suit,
          number: card.number,
          nameEn: card.nameEn,
          nameVi: card.nameVi,
          imageUrl: card.imageUrl.replace('.webp', '.png'),
          keywords: card.keywords,
          actionGroups: card.actionGroups,
          quickMeaning: card.quickMeaning,
          detailedDescription: card.detailedDescription,
          uprightMeaning: card.uprightMeaning,
          reversedMeaning: card.reversedMeaning,
          opposingCardSlugs: card.opposingCardSlugs,
          supportingCardSlugs: card.supportingCardSlugs,
          sourceUrl: card.sourceUrl,
        },
      });
      successCount++;
    } catch (e: any) {
      console.error(`Failed to upsert card ${card.slug}:`, e.message);
    }
  }

  console.log(`Successfully seeded ${successCount}/${cards.length} cards.`);
  console.log('--- DATABASE SEEDING FINISHED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
