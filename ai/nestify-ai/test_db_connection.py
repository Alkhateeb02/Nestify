import sys
import os
from sqlalchemy import create_engine, text
from core.config import settings

def test_connection():
    print(f"🔍 Testing connection to: {settings.DATABASE_URL.split('@')[-1]}")
    
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 1. Simple connectivity check
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            
            # 2. Check if properties table exists
            print("\n🔍 Checking for 'properties' table...")
            table_check = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'properties'
                );
            """)).scalar()
            
            if not table_check:
                print("⚠️  'properties' table does not exist. Creating it for testing...")
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS properties (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(255),
                        description TEXT,
                        price DECIMAL,
                        location VARCHAR(255),
                        room_type VARCHAR(50),
                        availability_status VARCHAR(50) DEFAULT 'available'
                    );
                """))
                
                print("📝 Adding dummy listings...")
                conn.execute(text("""
                    INSERT INTO properties (title, description, price, location, room_type)
                    VALUES 
                    ('Cozy Studio Near AHU', 'A small but comfortable studio within walking distance to Al-Hussein Bin Talal University. High-speed internet included.', 150, 'Near AHU', 'studio'),
                    ('Luxury Private Room Center', 'Spacious room in Ma''an city center. Close to shops and transport. Features AC and private bathroom.', 220, 'Ma''an Center', 'single'),
                    ('Shared Student Apartment', 'Modern apartment shared with 2 other students. Very quiet and good for study. Near connectors.', 120, 'Near Connectors', 'shared');
                """))
                conn.commit()
                print("✅ Table created and dummy data added!")
            else:
                print("✅ 'properties' table found.")
                
            # 3. Fetch count
            count = conn.execute(text("SELECT COUNT(*) FROM properties")).scalar()
            print(f"📊 Total listings in database: {count}")
            
            # 4. Show a sample
            print("\n👀 Sample Data:")
            rows = conn.execute(text("SELECT title, price, location FROM properties LIMIT 2"))
            for row in rows:
                print(f" - {row[0]} | {row[1]} JOD | {row[2]}")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 TIP: Make sure your PostgreSQL server is running and the DATABASE_URL in .env is correct.")

if __name__ == "__main__":
    test_connection()
