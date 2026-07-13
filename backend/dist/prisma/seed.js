"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dbPath = path.resolve(__dirname, '../dev.db');
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: dbPath });
const prisma = new client_1.PrismaClient({ adapter });
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
        }
        catch (e) {
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
//# sourceMappingURL=seed.js.map