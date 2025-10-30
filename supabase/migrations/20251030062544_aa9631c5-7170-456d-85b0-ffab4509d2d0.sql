-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('customer', 'barber');

-- Create enum for queue status
CREATE TYPE queue_status AS ENUM ('waiting', 'in_service', 'completed', 'cancelled');

-- Create profiles table for user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create barber shops table
CREATE TABLE barber_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_service_time INTEGER DEFAULT 30, -- in minutes
  opening_time TIME,
  closing_time TIME,
  price_range TEXT,
  services JSONB DEFAULT '[]',
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE barber_shops ENABLE ROW LEVEL SECURITY;

-- Barber shops policies
CREATE POLICY "Anyone can view active shops"
  ON barber_shops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Barbers can create shops"
  ON barber_shops FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'barber')
  );

CREATE POLICY "Shop owners can update their shops"
  ON barber_shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create queue entries table
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES barber_shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status queue_status DEFAULT 'waiting',
  position INTEGER,
  estimated_wait_time INTEGER, -- in minutes
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Enable realtime for queue entries
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;

-- Queue entries policies
CREATE POLICY "Anyone can view queue entries"
  ON queue_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can join queue"
  ON queue_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shop owners can update queue entries"
  ON queue_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barber_shops 
      WHERE id = queue_entries.shop_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can cancel their own queue entry"
  ON queue_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id AND status = 'waiting');

-- Create shop analytics table
CREATE TABLE shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES barber_shops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_customers INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  average_wait_time INTEGER DEFAULT 0,
  peak_hour INTEGER, -- 0-23
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, date)
);

-- Enable RLS
ALTER TABLE shop_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Shop owners can view their analytics"
  ON shop_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barber_shops 
      WHERE id = shop_analytics.shop_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can insert analytics"
  ON shop_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barber_shops 
      WHERE id = shop_analytics.shop_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update their analytics"
  ON shop_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barber_shops 
      WHERE id = shop_analytics.shop_id AND owner_id = auth.uid()
    )
  );

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate positions for all waiting entries in the shop
  WITH numbered_queue AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY joined_at) as new_position
    FROM queue_entries
    WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    AND status = 'waiting'
  )
  UPDATE queue_entries
  SET position = numbered_queue.new_position,
      estimated_wait_time = numbered_queue.new_position * (
        SELECT average_service_time 
        FROM barber_shops 
        WHERE id = COALESCE(NEW.shop_id, OLD.shop_id)
      )
  FROM numbered_queue
  WHERE queue_entries.id = numbered_queue.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update positions when queue changes
CREATE TRIGGER queue_position_update
AFTER INSERT OR UPDATE OR DELETE ON queue_entries
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();