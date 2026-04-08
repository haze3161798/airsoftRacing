-- CreateTable
CREATE TABLE "prize_tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prize_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize" (
    "id" TEXT NOT NULL,
    "sponsor_id" TEXT,
    "prize_tag_id" TEXT,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "image_data" BYTEA NOT NULL,
    "image_mime_type" VARCHAR(50) NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prize_sponsor_id_idx" ON "prize"("sponsor_id");

-- CreateIndex
CREATE INDEX "prize_prize_tag_id_idx" ON "prize"("prize_tag_id");

-- AddForeignKey
ALTER TABLE "prize" ADD CONSTRAINT "prize_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize" ADD CONSTRAINT "prize_prize_tag_id_fkey" FOREIGN KEY ("prize_tag_id") REFERENCES "prize_tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
