-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
    id VARCHAR PRIMARY KEY,
    citizen_name VARCHAR NOT NULL,
    mobile_number VARCHAR NOT NULL,
    village_name VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    image_path VARCHAR,
    status VARCHAR DEFAULT 'Pending' NOT NULL,
    priority VARCHAR DEFAULT 'Medium' NOT NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id SERIAL PRIMARY KEY,
    category VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    contact VARCHAR NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR NOT NULL
);

-- Seed resources database
INSERT INTO public.resources (category, name, address, contact, description, image_url) VALUES
('Schools', 'Zilla Parishad School', 'Main Road, Near Panchayat Hall, Gram Village', '+91 98765 43210', 'Primary and upper primary co-educational school providing quality education in local languages.', '/uploads/resources/school_zp.png'),
('Schools', 'Government High School', 'School Para, East Ward, Gram Village', '+91 98765 43211', 'Secondary educational institution with science labs, computer rooms, and sports ground.', '/uploads/resources/school_govt.png'),
('Hospitals', 'Primary Health Center', 'Hospital Road, Gram Village Center', '+91 98765 43212', '24/7 basic medical care facility, maternal services, vaccination drives, and free medicine distribution.', '/uploads/resources/hospital_phc.png'),
('Hospitals', 'Rural Hospital', 'Bypass Road, Outer Gram Village', '+91 98765 43213', 'Multi-specialty community hospital with ICU, inpatient ward, emergency trauma unit, and ambulance service.', '/uploads/resources/hospital_rural.png'),
('Water Infrastructure', 'Main Water Tank', 'Water Works Complex, North Ward, Gram Village', '+91 98765 43214', 'Overhead distribution reservoir supplying purified drinking water twice daily to all households.', '/uploads/resources/water_tank.png'),
('Water Infrastructure', 'Borewell Locations', 'Multiple spots (West Ward, Harijan Basti, Temple Square)', '+91 98765 43215', 'Community borewells fitted with hand pumps and solar-powered taps for continuous water access.', '/uploads/resources/water_borewell.png'),
('Panchayat', 'Gram Panchayat Office', 'Panchayat Chowk, Central Gram Village', '+91 98765 43216', 'Administrative head office for village governance, certificates issuing, and local dispute resolutions.', '/uploads/resources/panchayat_office.png'),
('Panchayat', 'Contact Information', 'Panchayat Chowk, Central Gram Village', '+91 98765 43217', 'Direct directory for Sarpanch, Gram Sevak, and Talathi for public grievances and administration.', '/uploads/resources/panchayat_contact.png'),
('Transportation', 'Bus Stops', 'State Highway Corner, Main Entrance, Gram Village', '+91 98765 43218', 'State transport bus stand connecting the village to block headquarters and district center hourly.', '/uploads/resources/transport_bus.png'),
('Transportation', 'Local Transport Points', 'Market Junction, Gram Village', '+91 98765 43219', 'Shared auto-rickshaws, jeeps, and shuttle services terminal available round the clock.', '/uploads/resources/transport_local.png')
ON CONFLICT DO NOTHING;

-- Seed complaints database
INSERT INTO public.complaints (id, citizen_name, mobile_number, village_name, title, description, category, status, priority, image_path, resolution_notes) VALUES
('GC-5021', 'Ramesh Kumar', '9876501234', 'Hirapur', 'Street Light Blown out', 'The main street light at Panchayat Chowk has been broken for three days. It gets very dark and unsafe at night.', 'Electricity', 'Pending', 'Low', NULL, NULL),
('GC-1884', 'Sunita Patil', '9823456789', 'Hirapur', 'Water Pipeline Leakage near school', 'Drinking water is leaking heavily from the main underground pipe near the Zilla Parishad School. It is creating a muddy swamp.', 'Water Supply', 'In Progress', 'High', NULL, 'Plumbing team dispatched. Identified the damaged pipe segment; replacement works are underway.'),
('GC-7212', 'Anil Yadav', '9933445566', 'Sajampur', 'Garbage accumulation at market road', 'Garbage has not been collected from the local market road corner for the past one week, causing extreme foul smell.', 'Sanitation', 'Resolved', 'Medium', NULL, 'Sanitation crew cleaned the area and installed two large waste bins. Regular daily pickup scheduled.'),
('GC-3901', 'Rajesh Patil', '9122334455', 'Hirapur', 'Potholes on Main Connecting Road', 'Large potholes have formed on the main road connecting the highway to the village after the recent heavy rains. Vehicles are getting damaged.', 'Roads', 'Pending', 'Emergency', NULL, NULL)
ON CONFLICT DO NOTHING;
