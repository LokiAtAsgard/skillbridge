CREATE DATABASE IF NOT EXISTS skillbridge_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skillbridge_db;

CREATE TABLE IF NOT EXISTS employers (
  employer_id       INT AUTO_INCREMENT PRIMARY KEY,
  company_name      VARCHAR(120) NOT NULL,
  contact_person    VARCHAR(100),
  email             VARCHAR(120) UNIQUE NOT NULL,
  phone             VARCHAR(20),
  city              VARCHAR(80),
  industry          VARCHAR(60),
  peso_verified     TINYINT(1) DEFAULT 0,
  subscription_plan ENUM('free','pro','enterprise') DEFAULT 'free',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS youth_users (
  user_id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(120) UNIQUE NOT NULL,
  phone            VARCHAR(20),
  city             VARCHAR(80),
  age              TINYINT,
  tesda_nc_level   VARCHAR(80),
  skills           TEXT,
  search_radius_km INT DEFAULT 15,
  otp_verified     TINYINT(1) DEFAULT 0,
  profile_boosted  TINYINT(1) DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  listing_id   INT AUTO_INCREMENT PRIMARY KEY,
  employer_id  INT NOT NULL,
  title        VARCHAR(120) NOT NULL,
  type         ENUM('apprenticeship','internship') NOT NULL,
  industry     VARCHAR(60),
  city         VARCHAR(80),
  allowance    DECIMAL(8,2),
  duration     VARCHAR(40),
  slots        INT DEFAULT 1,
  skills       TEXT,
  verified     TINYINT(1) DEFAULT 0,
  featured     TINYINT(1) DEFAULT 0,
  status       ENUM('active','closed','pending') DEFAULT 'active',
  posted_at    DATE,
  FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swipe_actions (
  swipe_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  listing_id    INT NOT NULL,
  direction     ENUM('up','down','right','left') NOT NULL,
  swiped_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES youth_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE,
  UNIQUE KEY unique_swipe (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS matches (
  match_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  listing_id   INT NOT NULL,
  matched_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status       ENUM('pending','accepted','rejected','hired') DEFAULT 'pending',
  FOREIGN KEY (user_id)    REFERENCES youth_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  report_id    INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id  INT,
  target_type  ENUM('listing','user','employer'),
  target_id    INT,
  reason       VARCHAR(255),
  status       ENUM('open','reviewed','resolved') DEFAULT 'open',
  reported_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employers (company_name, contact_person, email, phone, city, industry, peso_verified, subscription_plan) VALUES
('Santos Electric Services',     'Ramon Santos',     'rsantos@santoselectric.ph',  '09171234501', 'Batangas City', 'electrical',    1, 'pro'),
('Reyes Auto Shop',              'Jun Reyes',        'jun@reyesauto.ph',           '09171234502', 'Santo Tomas',   'automotive',    1, 'free'),
('Lim Construction Co.',         'Bernard Lim',      'blim@limconstruction.ph',    '09171234503', 'Lipa City',     'construction',  1, 'pro'),
('TechCore Solutions',           'Maricel Ty',       'mty@techcore.ph',            '09171234504', 'Calamba',       'it',            1, 'pro'),
('DigiPinas Inc.',               'Paolo Reyes',      'preyes@digipinas.ph',        '09171234505', 'Santa Rosa',    'it',            1, 'pro'),
('Kusina ni Aling Rosa',         'Rosa Buenaventura','rosa@kusinanialing.ph',      '09171234506', 'Batangas City', 'food',          1, 'free'),
('Mendoza Fabrication',          'Erick Mendoza',    'emendoza@mendozafab.ph',     '09171234507', 'Tanauan',       'manufacturing', 1, 'free'),
('Cruz and Partners CPA',        'Dan Cruz',         'dcruz@cruzpartners.ph',      '09171234508', 'Lucena',        'retail',        1, 'free'),
('Garcia Plumbing Services',     'Nonoy Garcia',     'ngarcia@garciaplumbing.ph',  '09171234509', 'Batangas City', 'construction',  1, 'free'),
('Pixel Studio PH',              'Iris Pixel',       'iris@pixelstudio.ph',        '09171234510', 'Antipolo',      'it',            1, 'pro'),
('CoolAir Technical Services',   'Felix Chua',       'fchua@coolairtech.ph',       '09171234511', 'Calamba',       'electrical',    1, 'pro'),
('Gonzales General Merchandise', 'Lino Gonzales',    'lgonzales@gonzalesgen.ph',   '09171234512', 'Lipa City',     'retail',        1, 'free');

INSERT INTO youth_users (full_name, email, phone, city, age, tesda_nc_level, skills, search_radius_km, otp_verified) VALUES
('Juan dela Cruz',     'juan@email.com',   '09281111111', 'Batangas City', 19, 'NCII Electrician',          'Electrical Wiring,Safety Protocols,Equipment Setup', 15, 1),
('Maria Santos',       'maria@email.com',  '09282222222', 'Lipa City',     20, 'NCII Food and Beverage',    'Food Preparation,Customer Service,Sanitation',       10, 1),
('Pedro Reyes',        'pedro@email.com',  '09283333333', 'Calamba',       18, 'NCII Computer Hardware',    'PC Assembly,OS Installation,Troubleshooting',        20, 1),
('Ana Bautista',       'ana@email.com',    '09284444444', 'Santa Rosa',    21, 'NCII Bookkeeping',          'Bookkeeping,Excel,BIR Forms',                        15, 1),
('Carlo Mendoza',      'carlo@email.com',  '09285555555', 'Tanauan',       19, 'NCII Welding',              'Arc Welding,Metal Cutting,Blueprint Reading',         10, 1),
('Liza Cruz',          'liza@email.com',   '09286666666', 'Lucena',        22, 'NCII Caregiving',           'Personal Care,First Aid,Patient Monitoring',          25, 1),
('Manny Torres',       'manny@email.com',  '09287777777', 'Antipolo',      20, 'NCII Automotive Servicing', 'Engine Repair,Diagnostics,Parts Replacement',         15, 1),
('Grace Flores',       'grace@email.com',  '09288888888', 'Batangas City', 18, NULL,                        'HTML,CSS,JavaScript,Figma',                           20, 1),
('Renz Aquino',        'renz@email.com',   '09289999999', 'Cabuyao',       21, 'NCII Masonry',              'Bricklaying,Plastering,Blueprint Reading',            10, 1),
('Sheena Villanueva',  'sheena@email.com', '09280000000', 'Antipolo',      19, NULL,                        'Photoshop,Illustrator,Social Media,Content Writing',  20, 1);

INSERT INTO listings (employer_id, title, type, industry, city, allowance, duration, slots, skills, verified, featured, status, posted_at) VALUES
(1,  'Electrical Apprentice',              'apprenticeship', 'electrical',    'Batangas City', 450, '6 months', 2, 'Electrical Wiring,Safety Protocols,Equipment Setup',     1, 1, 'active', '2024-11-01'),
(2,  'Automotive Technician Apprentice',   'apprenticeship', 'automotive',    'Santo Tomas',   400, '6 months', 3, 'Engine Repair,Diagnostics,Brake Systems',                1, 0, 'active', '2024-11-02'),
(3,  'Civil Works Apprentice',             'apprenticeship', 'construction',  'Lipa City',     420, '4 months', 4, 'Masonry,Carpentry,Blueprint Reading',                    1, 0, 'active', '2024-11-03'),
(4,  'IT Support Intern',                  'internship',     'it',            'Calamba',       500, '3 months', 2, 'Troubleshooting,Networking,Windows OS',                  1, 1, 'active', '2024-11-04'),
(5,  'Web Development Intern',             'internship',     'it',            'Santa Rosa',    550, '3 months', 2, 'HTML,CSS,JavaScript',                                    1, 1, 'active', '2024-11-05'),
(6,  'Food Service Apprentice',            'apprenticeship', 'food',          'Batangas City', 350, '3 months', 2, 'Food Preparation,Sanitation,Customer Service',           1, 0, 'active', '2024-11-06'),
(7,  'Welding Apprentice',                 'apprenticeship', 'manufacturing', 'Tanauan',       460, '6 months', 3, 'Arc Welding,Metal Cutting,Safety Protocols',             1, 0, 'active', '2024-11-07'),
(8,  'Accounting Intern',                  'internship',     'retail',        'Lucena',        480, '2 months', 1, 'Bookkeeping,Excel,BIR Forms',                            1, 0, 'active', '2024-11-08'),
(9,  'Plumbing Apprentice',                'apprenticeship', 'construction',  'Batangas City', 400, '6 months', 2, 'Pipe Fitting,Water Systems,Leak Detection',              1, 0, 'active', '2024-11-09'),
(10, 'Graphic Design Intern',              'internship',     'it',            'Antipolo',      520, '3 months', 2, 'Photoshop,Illustrator,Typography',                       1, 0, 'active', '2024-11-10'),
(11, 'HVAC Apprentice',                    'apprenticeship', 'electrical',    'Calamba',       470, '6 months', 2, 'Refrigeration,Aircon Repair,Electrical Wiring',          1, 0, 'active', '2024-11-11'),
(12, 'Retail Sales Apprentice',            'apprenticeship', 'retail',        'Lipa City',     340, '3 months', 4, 'Customer Service,Cashiering,Inventory',                  1, 0, 'active', '2024-11-12'),
(1,  'Electronics Repair Apprentice',      'apprenticeship', 'electrical',    'Santa Rosa',    430, '6 months', 2, 'Circuit Boards,Soldering,Component Testing',             1, 0, 'active', '2024-11-13'),
(4,  'Nursing Assistant Intern',           'internship',     'healthcare',    'Batangas City', 500, '3 months', 3, 'Patient Care,Vital Signs,First Aid',                     1, 1, 'active', '2024-11-14'),
(7,  'Carpentry Apprentice',               'apprenticeship', 'manufacturing', 'Tanauan',       390, '6 months', 3, 'Woodworking,Joinery,Finishing',                          1, 0, 'active', '2024-11-15'),
(5,  'Digital Marketing Intern',           'internship',     'it',            'Santa Rosa',    530, '3 months', 2, 'Social Media,Content Writing,SEO',                       1, 0, 'active', '2024-11-16'),
(3,  'Tile Setting Apprentice',            'apprenticeship', 'construction',  'Lucena',        380, '4 months', 2, 'Tile Installation,Grouting,Surface Prep',                1, 0, 'active', '2024-11-17'),
(4,  'Data Entry Intern',                  'internship',     'it',            'Calamba',       400, '2 months', 3, 'Microsoft Excel,Data Encoding,Accuracy',                 1, 0, 'active', '2024-11-18'),
(2,  'Motorcycle Repair Apprentice',       'apprenticeship', 'automotive',    'Antipolo',      380, '6 months', 2, 'Engine Overhaul,Carburetor Cleaning,Parts Replacement',  1, 0, 'active', '2024-11-19'),
(6,  'Bakery Apprentice',                  'apprenticeship', 'food',          'Lipa City',     330, '3 months', 2, 'Bread Making,Cake Decorating,Oven Operation',            1, 0, 'active', '2024-11-20'),
(4,  'Network Technician Intern',          'internship',     'it',            'Batangas City', 520, '3 months', 2, 'LAN Setup,Router Config,Cable Management',               1, 0, 'active', '2024-11-21'),
(7,  'Printing Press Apprentice',          'apprenticeship', 'manufacturing', 'Lucena',        360, '4 months', 2, 'Offset Printing,Color Mixing,Machine Operation',         1, 0, 'active', '2024-11-22'),
(1,  'Electrical Wiring Apprentice',       'apprenticeship', 'electrical',    'Cabuyao',       440, '6 months', 3, 'House Wiring,Panel Installation,Safety Check',           1, 0, 'active', '2024-11-23'),
(5,  'Customer Service Intern',            'internship',     'retail',        'Santa Rosa',    490, '2 months', 5, 'Communication,Problem Solving,Computer Basics',          1, 0, 'active', '2024-11-24'),
(3,  'Paint Works Apprentice',             'apprenticeship', 'construction',  'Antipolo',      360, '3 months', 3, 'Surface Prep,Interior Painting,Color Mixing',            1, 0, 'active', '2024-11-25'),
(10, 'Photography Intern',                 'internship',     'retail',        'Batangas City', 450, '2 months', 1, 'Camera Operation,Lightroom,Event Coverage',              1, 0, 'active', '2024-11-26'),
(7,  'Garment Sewing Apprentice',          'apprenticeship', 'manufacturing', 'Tanauan',       320, '4 months', 4, 'Sewing Machine,Pattern Cutting,Quality Check',           1, 0, 'active', '2024-11-27'),
(1,  'Solar Panel Installer Apprentice',   'apprenticeship', 'electrical',    'Lipa City',     500, '6 months', 2, 'Solar Wiring,Panel Mounting,Safety Protocols',           1, 1, 'active', '2024-11-28'),
(8,  'Administrative Intern',              'internship',     'retail',        'Calamba',       430, '2 months', 2, 'Filing,Scheduling,MS Office',                            1, 0, 'active', '2024-11-29'),
(11, 'Refrigeration Apprentice',           'apprenticeship', 'electrical',    'Lucena',        420, '6 months', 2, 'Refrigerant Handling,Compressor Repair,Leak Testing',    1, 0, 'active', '2024-11-30'),
(10, 'Video Editing Intern',               'internship',     'it',            'Antipolo',      510, '3 months', 2, 'Premiere Pro,After Effects,Color Grading',               1, 0, 'active', '2024-12-01'),
(3,  'Masonry Apprentice',                 'apprenticeship', 'construction',  'Cabuyao',       400, '6 months', 3, 'Bricklaying,Plastering,CHB Installation',                1, 0, 'active', '2024-12-02'),
(4,  'Computer Hardware Tech Apprentice',  'apprenticeship', 'it',            'Batangas City', 420, '4 months', 2, 'PC Assembly,OS Installation,Hardware Diagnosis',         1, 0, 'active', '2024-12-03'),
(6,  'Caregiver Apprentice',               'apprenticeship', 'healthcare',    'Lipa City',     380, '6 months', 3, 'Personal Care,Medication Reminders,Mobility Assistance', 1, 0, 'active', '2024-12-04'),
(5,  'E-Commerce Intern',                  'internship',     'retail',        'Santa Rosa',    460, '2 months', 2, 'Shopee,Lazada,Product Listing',                          1, 0, 'active', '2024-12-05'),
(7,  'Forklift Operator Apprentice',       'apprenticeship', 'manufacturing', 'Calamba',       480, '3 months', 2, 'Forklift Operation,Warehouse Safety,Inventory Counting', 1, 0, 'active', '2024-12-06'),
(6,  'Food Packaging Apprentice',          'apprenticeship', 'food',          'Tanauan',       350, '3 months', 5, 'Packaging,QA,Sanitation Standards',                      1, 0, 'active', '2024-12-07'),
(5,  'Android Developer Intern',           'internship',     'it',            'Santa Rosa',    600, '3 months', 2, 'Java,Android Studio,REST APIs',                          1, 1, 'active', '2024-12-08'),
(9,  'Landscaping Apprentice',             'apprenticeship', 'construction',  'Antipolo',      360, '3 months', 3, 'Plant Care,Irrigation,Landscape Design',                 1, 0, 'active', '2024-12-09'),
(8,  'HR Assistant Intern',                'internship',     'retail',        'Calamba',       470, '2 months', 2, 'Recruitment,201 Files,Labor Law Basics',                 1, 0, 'active', '2024-12-10'),
(4,  'Dialysis Technician Apprentice',     'apprenticeship', 'healthcare',    'Lipa City',     490, '6 months', 2, 'Machine Operation,Patient Monitoring,Sanitation',        1, 0, 'active', '2024-12-11'),
(7,  'Steel Works Apprentice',             'apprenticeship', 'manufacturing', 'Cabuyao',       450, '6 months', 3, 'Structural Welding,Metal Cutting,Blueprint Reading',     1, 0, 'active', '2024-12-12'),
(5,  'Social Media Intern',                'internship',     'it',            'Batangas City', 480, '3 months', 2, 'Facebook Ads,Canva,Content Planning',                    1, 0, 'active', '2024-12-13'),
(11, 'AC Installation Apprentice',         'apprenticeship', 'electrical',    'Antipolo',      460, '4 months', 3, 'AC Installation,Gas Charging,Electrical Wiring',         1, 0, 'active', '2024-12-14'),
(8,  'Logistics Intern',                   'internship',     'retail',        'Lucena',        440, '2 months', 2, 'Route Planning,Inventory,Documentation',                 1, 0, 'active', '2024-12-15'),
(1,  'Electrical Panel Wireman Apprentice','apprenticeship', 'electrical',    'Batangas City', 480, '6 months', 2, 'Panel Wiring,Circuit Breakers,Load Computation',         1, 0, 'active', '2024-12-16'),
(4,  'Java Developer Intern',              'internship',     'it',            'Calamba',       580, '3 months', 2, 'Java,MySQL,Spring Boot',                                 1, 1, 'active', '2024-12-17'),
(3,  'Tile and Marble Apprentice',         'apprenticeship', 'construction',  'Santa Rosa',    390, '4 months', 2, 'Marble Cutting,Tile Adhesive,Leveling',                  1, 0, 'active', '2024-12-18'),
(6,  'Barista Apprentice',                 'apprenticeship', 'food',          'Lipa City',     350, '3 months', 2, 'Espresso,Latte Art,Coffee Knowledge',                    1, 0, 'active', '2024-12-19'),
(5,  'UI/UX Design Intern',                'internship',     'it',            'Calamba',       560, '3 months', 2, 'Figma,Wireframing,User Research',                        1, 1, 'active', '2024-12-20');

-- Search by keyword
SELECT l.listing_id, l.title, l.type, e.company_name, l.city, l.allowance
FROM listings l
JOIN employers e ON l.employer_id = e.employer_id
WHERE l.title LIKE '%electrical%' OR l.skills LIKE '%electrical%';

-- Filter by city and type
SELECT l.title, e.company_name, l.allowance, l.duration
FROM listings l
JOIN employers e ON l.employer_id = e.employer_id
WHERE l.city = 'Batangas City' AND l.type = 'apprenticeship' AND l.status = 'active';

-- Sort by allowance
SELECT l.title, e.company_name, l.city, l.allowance
FROM listings l
JOIN employers e ON l.employer_id = e.employer_id
WHERE l.status = 'active' ORDER BY l.allowance DESC;

-- Featured listings
SELECT l.listing_id, l.title, l.type, e.company_name, l.city, l.allowance
FROM listings l
JOIN employers e ON l.employer_id = e.employer_id
WHERE l.featured = 1 AND l.status = 'active';

-- Count per city
SELECT city, COUNT(*) AS total FROM listings WHERE status = 'active' GROUP BY city ORDER BY total DESC;

-- Count per industry
SELECT industry, COUNT(*) AS total FROM listings WHERE status = 'active' GROUP BY industry ORDER BY total DESC;

-- Full export
SELECT l.listing_id, l.title, l.type, l.industry, e.company_name, l.city,
  l.allowance, l.duration, l.slots, l.skills,
  IF(l.verified=1,'Yes','No') AS verified,
  IF(l.featured=1,'Yes','No') AS featured,
  l.status, l.posted_at
FROM listings l
JOIN employers e ON l.employer_id = e.employer_id
ORDER BY l.listing_id;