-- ============================================================================
-- PREREQUISITES FOR DASHBOARD TEST DATA
-- Run this ONCE before running test-data-dashboard.sql
-- ============================================================================

-- 1. Create Warehouses
INSERT INTO "Warehouses" ("Name", "Description", "IsActive", "CompanyId")
VALUES 
    ('Entrepôt Principal', 'Magasin principal', true, 1),
    ('Entrepôt Secondaire', 'Magasin secondaire', true, 1)
ON CONFLICT DO NOTHING;

-- 2. Create Production Lines
INSERT INTO "Lines" ("Description", "IsActive", "CompanyId")
VALUES 
    ('Ligne de Production 1', true, 1),
    ('Ligne de Production 2', true, 1)
ON CONFLICT DO NOTHING;

-- 3. Create Status Records
INSERT INTO "Status" ("Description", "Type", "CompanyId")
VALUES 
    ('Active', 'Picklist', 1),
    ('En cours', 'Picklist', 1),
    ('Terminé', 'Picklist', 1),
    ('NonServie', 'Picklist', 1),
    ('Servie', 'Picklist', 1),
    ('En cours', 'DetailPicklist', 1),
    ('En cours', 'ReturnLine', 1),
    ('Traité', 'ReturnLine', 1),
    ('Rejeté', 'ReturnLine', 1)
ON CONFLICT DO NOTHING;

-- Verification
SELECT 'Created Warehouses:', COUNT(*) FROM "Warehouses";
SELECT 'Created Lines:', COUNT(*) FROM "Lines";
SELECT 'Created Status records:', COUNT(*) FROM "Status";
