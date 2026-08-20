-- Keep the SERIAL sequence ahead of existing category IDs.
SELECT setval(
  pg_get_serial_sequence('categories', 'category_id'),
  COALESCE((SELECT MAX(category_id) FROM categories), 0) + 1,
  false
);