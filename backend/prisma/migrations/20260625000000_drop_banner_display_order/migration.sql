-- Drop the unused display_order column from banners table.
-- The Banner admin UI no longer tracks a custom sort order (banners are
-- surfaced in createdAt-descending order instead).

ALTER TABLE "banners" DROP COLUMN "display_order";
