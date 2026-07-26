-- Drop the unused target_url column from banners table.
-- Banners no longer deep-link to a target URL; navigation is now handled
-- client-side via the banner's own click handler.

ALTER TABLE "banners" DROP COLUMN "target_url";