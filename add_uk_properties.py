from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=5000)
db = client["rentease"]
biz = db["biz"]

# Sample UK properties
uk_properties = [
    {
        "type": "property",
        "title": "Modern 2-Bedroom Flat in Central London",
        "price": 2500,
        "location": "London",
        "property_type": "flat",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Spacious 3-Bedroom House in Manchester",
        "price": 1800,
        "location": "Manchester",
        "property_type": "house",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Luxury Penthouse in Birmingham City Centre",
        "price": 3200,
        "location": "Birmingham",
        "property_type": "penthouse",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Cozy Studio Apartment near Edinburgh Castle",
        "price": 1200,
        "location": "Edinburgh",
        "property_type": "studio",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "4-Bedroom Bungalow in Bristol Suburbs",
        "price": 2100,
        "location": "Bristol",
        "property_type": "bungalow",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Charming Cottage in Cambridge",
        "price": 1600,
        "location": "Cambridge",
        "property_type": "cottage",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Modern Apartment in Leeds City Centre",
        "price": 1400,
        "location": "Leeds",
        "property_type": "apartment",
        "agent_id": "test_agent_id",
        "available": True
    },
    {
        "type": "property",
        "title": "Luxury 3-Bedroom House in Liverpool",
        "price": 1900,
        "location": "Liverpool",
        "property_type": "house",
        "agent_id": "test_agent_id",
        "available": True
    }
]

# Clear existing properties (optional)
print("Clearing existing properties...")
result = biz.delete_many({"type": "property"})
print(f"Deleted {result.deleted_count} existing properties")

# Insert new UK properties
print("\nAdding UK properties...")
result = biz.insert_many(uk_properties)
print(f"Added {len(result.inserted_ids)} UK properties")

print("\nCurrent properties in database:")
properties = list(biz.find({"type": "property"}))
for prop in properties:
    print(f"  - {prop['title']} | {prop['location']} | £{prop['price']}/month")

print("\n✅ UK properties added successfully!")
