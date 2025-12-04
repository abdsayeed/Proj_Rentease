"""
Script to add sample properties to the MongoDB database
"""
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['rentease']
biz_collection = db['biz']

# Sample properties data
sample_properties = [
    {
        "type": "property",
        "title": "Luxury 2BHK Apartment in Mayfair",
        "description": "Beautiful 2 bedroom apartment with modern amenities in the heart of Mayfair",
        "price": 3500,
        "location": "Mayfair",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 1200,
        "amenities": ["Parking", "Gym", "24/7 Security", "Swimming Pool"],
        "agent_id": "sample_agent_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Cozy Studio in Chelsea",
        "description": "Perfect studio apartment for singles or couples in trendy Chelsea",
        "price": 1800,
        "location": "Chelsea",
        "property_type": "studio",
        "bedrooms": 1,
        "bathrooms": 1,
        "area": 500,
        "amenities": ["WiFi", "Furnished", "Near Tube"],
        "agent_id": "sample_agent_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 3BHK House in Kensington",
        "description": "Large family house with garden in prestigious Kensington area",
        "price": 5500,
        "location": "Kensington",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 3,
        "area": 2000,
        "amenities": ["Garden", "Parking", "Fireplace", "Pet Friendly"],
        "agent_id": "sample_agent_2",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern Flat in Camden",
        "description": "Contemporary 2 bedroom flat near Camden Market",
        "price": 2200,
        "location": "Camden",
        "property_type": "flat",
        "bedrooms": 2,
        "bathrooms": 1,
        "area": 900,
        "amenities": ["Balcony", "Modern Kitchen", "Near Transport"],
        "agent_id": "sample_agent_2",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Penthouse in Canary Wharf",
        "description": "Stunning penthouse with river views in Canary Wharf",
        "price": 6000,
        "location": "Canary Wharf",
        "property_type": "penthouse",
        "bedrooms": 3,
        "bathrooms": 3,
        "area": 2500,
        "amenities": ["River View", "Concierge", "Gym", "Parking", "Balcony"],
        "agent_id": "sample_agent_3",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Affordable 1BHK in Brixton",
        "description": "Budget-friendly apartment in vibrant Brixton neighborhood",
        "price": 1200,
        "location": "Brixton",
        "property_type": "apartment",
        "bedrooms": 1,
        "bathrooms": 1,
        "area": 600,
        "amenities": ["WiFi", "Near Shops", "Public Transport"],
        "agent_id": "sample_agent_3",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Elegant 2BHK in Notting Hill",
        "description": "Charming apartment in the iconic Notting Hill area",
        "price": 3200,
        "location": "Notting Hill",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 1100,
        "amenities": ["Hardwood Floors", "High Ceilings", "Near Portobello Market"],
        "agent_id": "sample_agent_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Family House in Hampstead",
        "description": "Beautiful 4 bedroom house with garden in leafy Hampstead",
        "price": 7000,
        "location": "Hampstead",
        "property_type": "house",
        "bedrooms": 4,
        "bathrooms": 3,
        "area": 2800,
        "amenities": ["Garden", "Garage", "Near Heath", "Fireplace"],
        "agent_id": "sample_agent_2",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# Clear existing properties (optional)
print("Clearing existing properties...")
biz_collection.delete_many({"type": "property"})

# Insert sample properties
print(f"Inserting {len(sample_properties)} sample properties...")
result = biz_collection.insert_many(sample_properties)

print(f"✓ Successfully added {len(result.inserted_ids)} properties to the database!")
print("\nProperty IDs:")
for i, prop_id in enumerate(result.inserted_ids, 1):
    print(f"  {i}. {prop_id}")

# Verify
count = biz_collection.count_documents({"type": "property"})
print(f"\nTotal properties in database: {count}")

client.close()
print("\n✓ Done!")
