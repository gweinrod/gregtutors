/*
  # Initial Schema for Greg Tutors

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `has_schedule_access` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `quotes`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    - `reviews`
      - `id` (uuid, primary key)
      - `quote` (text)
      - `client` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to quotes and reviews
    - Add policies for authenticated users to read their own profile data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  has_schedule_access boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  client text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Quotes policies (public read)
CREATE POLICY "Anyone can read active quotes"
  ON quotes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Reviews policies (public read)
CREATE POLICY "Anyone can read active reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Insert default quotes
INSERT INTO quotes (text, author) VALUES
  ('The world is full of magical things patiently waiting for our wits to grow sharper.', 'Russell'),
  ('Anyone who has never made a mistake has never tried anything new.', 'Einstein'),
  ('To improve is to change; to be perfect is to change often. Progress is impossible without change, and those who cannot change their minds cannot change anything.', 'Aristotle');

-- Insert default reviews
INSERT INTO reviews (quote, client) VALUES
  ('Great experience with Gregory! My son was engaged all the time during the class and was interested to continue learning! Thank you!', 'Julia'),
  ('Gregory has been tutoring my niece (8) and my nephew (7) for the past half a year. They came from Ukraine not knowing how to read in English. Both kids are almost at their grade level now.', 'Katerina'),
  ('After Greg tutored my daughter in AP Physics, I asked whether there were any topics they covered where she thought ''Oh, THAT''S what he (her teacher) meant!'' She replied ''Everything!''', 'Jun');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();