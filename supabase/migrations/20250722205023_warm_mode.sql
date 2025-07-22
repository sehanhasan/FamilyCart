/*
  # FamilyCart Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `color` (text)
      - `created_at` (timestamp)
    - `grocery_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `quantity` (integer)
      - `priority` (text: 'low' | 'high')
      - `status` (text: 'to-buy' | 'bought')
      - `added_by` (uuid, foreign key to users)
      - `bought_by` (uuid, foreign key to users)
      - `bought_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (no auth required)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#10B981',
  created_at timestamptz DEFAULT now()
);

-- Create grocery_items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'Groceries',
  quantity integer DEFAULT 1,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'high', 'medium')),
  status text DEFAULT 'to-buy' CHECK (status IN ('to-buy', 'bought')),
  added_by uuid REFERENCES users(id) ON DELETE CASCADE,
  bought_by uuid REFERENCES users(id) ON DELETE SET NULL,
  bought_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Allow public access to users"
  ON users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to grocery_items"
  ON grocery_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert demo users
INSERT INTO users (id, name, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Umama', '#10B981'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Hareem', '#3B82F6'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Habiba', '#F59E0B'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Ammi', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;