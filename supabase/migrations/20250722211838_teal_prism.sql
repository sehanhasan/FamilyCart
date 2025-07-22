/*
  # Update quantity field to support text display

  1. Changes
    - Add a new column `quantity_text` to store text representations
    - Keep existing `quantity` as integer for database operations
    - Update existing data to show numeric quantities as text

  2. Notes
    - Database still stores quantity as integer for calculations
    - App will display quantity_text when available, fallback to quantity
*/

-- Add quantity_text column to store text representations like "1kg", "500g", etc.
ALTER TABLE grocery_items ADD COLUMN IF NOT EXISTS quantity_text text;

-- Update existing records to have quantity_text based on current quantity
UPDATE grocery_items 
SET quantity_text = quantity::text 
WHERE quantity_text IS NULL;