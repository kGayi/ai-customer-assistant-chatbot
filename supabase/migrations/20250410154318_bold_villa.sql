/*
  # Create tables for AI Customer Assistant

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `stock` (integer)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `status` (text)
      - `total` (numeric)
      - `created_at` (timestamp)
    
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `response` (text)
      - `created_at` (timestamp)
    
    - `store_policies`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users for products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Store policies table
CREATE TABLE IF NOT EXISTS store_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE store_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users for store policies"
  ON store_policies
  FOR SELECT
  TO authenticated
  USING (true);