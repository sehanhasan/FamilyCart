/*
  # Create shared lists tables

  1. New Tables
    - `shared_lists`
      - `id` (text, primary key) - unique list identifier
      - `name` (text) - list name
      - `created_at` (timestamp)
      - `share_url` (text) - full shareable URL
    - `shared_list_items`
      - `id` (uuid, primary key)
      - `list_id` (text, foreign key to shared_lists)
      - `name` (text) - item name
      - `quantity` (text) - item quantity
      - `priority` (text) - 'low' or 'high'
      - `status` (text) - 'to-buy' or 'bought'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (no authentication required)
*/

-- Create shared_lists table
CREATE TABLE IF NOT EXISTS shared_lists (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  share_url text NOT NULL
);

-- Create shared_list_items table
CREATE TABLE IF NOT EXISTS shared_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id text NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity text DEFAULT '1',
  priority text DEFAULT 'low' CHECK (priority IN ('low', 'high')),
  status text DEFAULT 'to-buy' CHECK (status IN ('to-buy', 'bought')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public access to shared_lists"
  ON shared_lists
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to shared_list_items"
  ON shared_list_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_list_items_list_id ON shared_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_items_status ON shared_list_items(status);