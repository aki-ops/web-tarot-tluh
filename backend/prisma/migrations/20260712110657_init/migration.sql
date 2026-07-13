-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "arcana_type" TEXT NOT NULL,
    "suit" TEXT,
    "number" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "action_groups" JSONB NOT NULL,
    "quick_meaning" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "upright_meaning" TEXT NOT NULL,
    "reversed_meaning" TEXT,
    "opposing_card_slugs" JSONB NOT NULL,
    "supporting_card_slugs" JSONB NOT NULL,
    "source_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "draws" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "intent" TEXT,
    "cards" JSONB NOT NULL,
    "user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "cards_slug_key" ON "cards"("slug");
