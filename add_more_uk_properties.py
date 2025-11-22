from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://127.0.0.1:27017/', serverSelectionTimeoutMS=5000)
db = client['rentease']
coll = db['biz']

print("Adding UK properties to database...\n")

# Extended list of UK properties with variety
properties = [
    # London Properties
    {
        "type": "property",
        "title": "Modern 2-Bedroom Flat in Central London",
        "price": 2500,
        "location": "London",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Stunning modern flat in the heart of London with excellent transport links.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Luxury 3-Bedroom Penthouse in Canary Wharf",
        "price": 4500,
        "location": "London",
        "property_type": "penthouse",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Breathtaking views of the Thames from this premium penthouse.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Charming Studio Apartment in Shoreditch",
        "price": 1400,
        "location": "London",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Perfect for young professionals in trendy Shoreditch.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Elegant 4-Bedroom House in Kensington",
        "price": 6500,
        "location": "London",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Prestigious Victorian house in one of London's finest areas.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Contemporary 1-Bedroom Flat in Westminster",
        "price": 2200,
        "location": "London",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Minutes from Big Ben and Parliament in prime location.",
        "created_at": datetime.utcnow()
    },
    
    # Manchester Properties
    {
        "type": "property",
        "title": "Spacious 3-Bedroom House in Manchester",
        "price": 1800,
        "location": "Manchester",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home with garden in vibrant Manchester neighborhood.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 2-Bedroom Apartment in City Centre",
        "price": 1600,
        "location": "Manchester",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Perfect for city living with all amenities nearby.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Luxury Penthouse in Northern Quarter",
        "price": 2800,
        "location": "Manchester",
        "property_type": "penthouse",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "High-end living in Manchester's creative district.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Cozy 1-Bedroom Flat in Salford Quays",
        "price": 1200,
        "location": "Manchester",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Waterfront property with stunning views.",
        "created_at": datetime.utcnow()
    },
    
    # Birmingham Properties
    {
        "type": "property",
        "title": "Luxury Penthouse in Birmingham City Centre",
        "price": 3200,
        "location": "Birmingham",
        "property_type": "penthouse",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Premium living with panoramic city views.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 2-Bedroom Apartment in Digbeth",
        "price": 1500,
        "location": "Birmingham",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Contemporary apartment in Birmingham's cultural quarter.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 4-Bedroom House in Edgbaston",
        "price": 2600,
        "location": "Birmingham",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in prestigious Birmingham suburb.",
        "created_at": datetime.utcnow()
    },
    
    # Edinburgh Properties
    {
        "type": "property",
        "title": "Cozy Studio Apartment near Edinburgh Castle",
        "price": 1200,
        "location": "Edinburgh",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Historic location with easy access to Old Town.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Georgian 3-Bedroom Flat in New Town",
        "price": 2400,
        "location": "Edinburgh",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Period features in UNESCO World Heritage site.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 2-Bedroom Apartment in Leith",
        "price": 1600,
        "location": "Edinburgh",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Waterfront living in Edinburgh's trendy port area.",
        "created_at": datetime.utcnow()
    },
    
    # Bristol Properties
    {
        "type": "property",
        "title": "4-Bedroom Bungalow in Bristol Suburbs",
        "price": 2100,
        "location": "Bristol",
        "property_type": "bungalow",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Peaceful family home with large garden.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Stylish 2-Bedroom Flat in Clifton",
        "price": 1900,
        "location": "Bristol",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Elegant living near Clifton Suspension Bridge.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern Studio in City Centre",
        "price": 1100,
        "location": "Bristol",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Compact city living for professionals.",
        "created_at": datetime.utcnow()
    },
    
    # Cambridge Properties
    {
        "type": "property",
        "title": "Charming Cottage in Cambridge",
        "price": 1600,
        "location": "Cambridge",
        "property_type": "cottage",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Traditional English cottage near historic colleges.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 3-Bedroom House near University",
        "price": 2300,
        "location": "Cambridge",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Perfect for academics and families.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Contemporary 1-Bedroom Flat",
        "price": 1400,
        "location": "Cambridge",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "New build apartment with modern amenities.",
        "created_at": datetime.utcnow()
    },
    
    # Leeds Properties
    {
        "type": "property",
        "title": "Modern Apartment in Leeds City Centre",
        "price": 1400,
        "location": "Leeds",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "City living with excellent shopping nearby.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 3-Bedroom House in Chapel Allerton",
        "price": 1800,
        "location": "Leeds",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in popular Leeds suburb.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Luxury 2-Bedroom Penthouse",
        "price": 2200,
        "location": "Leeds",
        "property_type": "penthouse",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Premium apartment with city views.",
        "created_at": datetime.utcnow()
    },
    
    # Liverpool Properties
    {
        "type": "property",
        "title": "Luxury 3-Bedroom House in Liverpool",
        "price": 1900,
        "location": "Liverpool",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Beautiful home in Georgian quarter.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 2-Bedroom Flat in Baltic Triangle",
        "price": 1500,
        "location": "Liverpool",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Creative district living with character.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Waterfront Studio Apartment",
        "price": 1100,
        "location": "Liverpool",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Albert Dock views in iconic location.",
        "created_at": datetime.utcnow()
    },
    
    # Glasgow Properties
    {
        "type": "property",
        "title": "Victorian 3-Bedroom Flat in West End",
        "price": 1700,
        "location": "Glasgow",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Period features in bohemian neighborhood.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 2-Bedroom Apartment in Merchant City",
        "price": 1500,
        "location": "Glasgow",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Contemporary living in historic district.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 4-Bedroom House in Bearsden",
        "price": 2200,
        "location": "Glasgow",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in desirable suburb.",
        "created_at": datetime.utcnow()
    },
    
    # Cardiff Properties
    {
        "type": "property",
        "title": "Contemporary 2-Bedroom Flat in Cardiff Bay",
        "price": 1400,
        "location": "Cardiff",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Waterfront living near Senedd.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 3-Bedroom House in Pontcanna",
        "price": 1800,
        "location": "Cardiff",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Victorian terrace in leafy neighborhood.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "City Centre Studio Apartment",
        "price": 900,
        "location": "Cardiff",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Perfect for students and young professionals.",
        "created_at": datetime.utcnow()
    },
    
    # Newcastle Properties
    {
        "type": "property",
        "title": "Luxury 2-Bedroom Apartment in Quayside",
        "price": 1600,
        "location": "Newcastle",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Riverside living with stunning views.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 4-Bedroom House in Jesmond",
        "price": 2000,
        "location": "Newcastle",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in popular Newcastle suburb.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern Studio in City Centre",
        "price": 950,
        "location": "Newcastle",
        "property_type": "studio",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Compact city living near metro station.",
        "created_at": datetime.utcnow()
    },
    
    # Sheffield Properties
    {
        "type": "property",
        "title": "Contemporary 2-Bedroom Flat in Sheffield",
        "price": 1100,
        "location": "Sheffield",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Modern apartment near universities.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "3-Bedroom House in Ecclesall",
        "price": 1600,
        "location": "Sheffield",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in sought-after area.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Penthouse Apartment with City Views",
        "price": 2100,
        "location": "Sheffield",
        "property_type": "penthouse",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Luxury living overlooking the Peak District.",
        "created_at": datetime.utcnow()
    },
    
    # Oxford Properties
    {
        "type": "property",
        "title": "Historic 2-Bedroom Cottage in Oxford",
        "price": 2000,
        "location": "Oxford",
        "property_type": "cottage",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Charming cottage near university colleges.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Modern 1-Bedroom Flat in Jericho",
        "price": 1600,
        "location": "Oxford",
        "property_type": "flat",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Trendy neighborhood close to city centre.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Spacious 3-Bedroom House in Summertown",
        "price": 2800,
        "location": "Oxford",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Family home in exclusive Oxford suburb.",
        "created_at": datetime.utcnow()
    },
    
    # Additional variety properties
    {
        "type": "property",
        "title": "Elegant 5-Bedroom House in Bath",
        "price": 3500,
        "location": "Bristol",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Georgian townhouse in historic spa city.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Warehouse Conversion Loft in Manchester",
        "price": 2400,
        "location": "Manchester",
        "property_type": "apartment",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Unique industrial living space with character.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Riverside 2-Bedroom Apartment",
        "price": 1800,
        "location": "Newcastle",
        "property_type": "apartment",
        "available": False,
        "agent_id": "test_agent_id",
        "description": "Recently let - stunning river views.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Luxury 3-Bedroom Mews House in London",
        "price": 5500,
        "location": "London",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Exclusive cobbled mews in Mayfair.",
        "created_at": datetime.utcnow()
    },
    {
        "type": "property",
        "title": "Converted Chapel 4-Bedroom in Edinburgh",
        "price": 3200,
        "location": "Edinburgh",
        "property_type": "house",
        "available": True,
        "agent_id": "test_agent_id",
        "description": "Unique property with original features.",
        "created_at": datetime.utcnow()
    },
]

# Insert properties
result = coll.insert_many(properties)
print(f"✅ Added {len(result.inserted_ids)} properties successfully!\n")

# Show summary
print("Properties by location:")
pipeline = [
    {"$match": {"type": "property"}},
    {"$group": {"_id": "$location", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
summary = list(coll.aggregate(pipeline))
for item in summary:
    print(f"  {item['_id']}: {item['count']} properties")

print(f"\nTotal properties in database: {coll.count_documents({'type': 'property'})}")

client.close()
