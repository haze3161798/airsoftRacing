-- CreateTable
CREATE TABLE "sponsor" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "image_data" BYTEA NOT NULL,
    "image_mime_type" VARCHAR(50) NOT NULL,
    "link_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sponsor_pkey" PRIMARY KEY ("id")
);
