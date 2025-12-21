-- ============================================================================
-- WAREHOUSE DASHBOARD TEST DATA GENERATOR - FIXED VERSION
-- Database: PostgreSQL
-- Date: 2025-12-06
-- ============================================================================
--
-- IMPORTANT FIXES:
--   - Changed "Statuses" to "Status" (singular table name)
--   - Changed Status."Name" to Status."Description"
--   - Removed ON CONFLICT clause (no unique constraint on Articles)
--   - Fixed variable initialization in MovementTraces section
--
-- Expected Results:
--   - 30 test articles
--   - 5-7 active picklists
--   - 6-8 returns in progress
--   - 15-25 today's movements
--   - 7-day stock evolution data
--   - Top 10 articles by movements
-- ============================================================================

-- ============================================================================
-- CLEANUP (Optional - Uncomment to delete existing test data)
-- ============================================================================
-- DELETE FROM "MovementTraces" WHERE "CompanyId" = 1 AND "UsNom" LIKE 'US-%';
-- DELETE FROM "DetailPicklists" WHERE "CompanyId" = 1 AND "Emplacement" LIKE 'A-%';
-- DELETE FROM "ReturnLines" WHERE "CompanyId" = 1 AND "UsCode" LIKE 'US-RET-%';
-- DELETE FROM "Picklists" WHERE "CompanyId" = 1 AND "Name" LIKE 'PICK-TEST%';
-- DELETE FROM "Articles" WHERE "CompanyId" = 1 AND "CodeProduit" LIKE 'TEST-%';

-- ============================================================================
-- SECTION 1: ARTICLES
-- ============================================================================
DO $$
DECLARE
    i INT;
    article_code VARCHAR(50);
    company_id INT := 1;
BEGIN
    FOR i IN 1..30 LOOP
        article_code := 'TEST-ART-' || LPAD(i::TEXT, 4, '0');
        
        INSERT INTO "Articles" (
            "CodeProduit", 
            "Designation", 
            "DateAjout", 
            "IsActive", 
            "CompanyId"
        ) VALUES (
            article_code,
            'Article Test ' || i || ' - ' || 
                CASE 
                    WHEN i <= 10 THEN 'CRITIQUE'
                    WHEN i <= 20 THEN 'NORMAL'
                    ELSE 'BIEN APPROVISIONNÉ'
                END,
            NOW() - (RANDOM() * INTERVAL '90 days'),
            true,
            company_id
        );
    END LOOP;
    
    RAISE NOTICE 'Created 30 test articles';
END $$;

-- ============================================================================
-- SECTION 2: PICKLISTS
-- ============================================================================
DO $$
DECLARE
    i INT;
    picklist_name VARCHAR(100);
    status_id INT;
    warehouse_id INT;
    line_id INT;
    company_id INT := 1;
BEGIN
    -- Get first available warehouse and line
    SELECT "Id" INTO warehouse_id FROM "Warehouses" WHERE "IsActive" = true LIMIT 1;
    SELECT "Id" INTO line_id FROM "Lines" WHERE "IsActive" = true LIMIT 1;
    
    IF warehouse_id IS NULL OR line_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: Please create at least 1 Warehouse and 1 Line first';
    END IF;
    
    FOR i IN 1..12 LOOP
        picklist_name := 'PICK-TEST-' || TO_CHAR(NOW() - (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0');
        
        -- Get status based on Description field
        IF i <= 6 THEN
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'Active' AND "Type" = 'Picklist' LIMIT 1;
        ELSIF i <= 9 THEN
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'En cours' AND "Type" = 'Picklist' LIMIT 1;
        ELSE
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'Terminé' AND "Type" = 'Picklist' LIMIT 1;
        END IF;
        
        IF status_id IS NULL THEN
            RAISE EXCEPTION 'ERROR: Status records not found. Please create Status records first';
        END IF;
        
        INSERT INTO "Picklists" (
            "Name",
            "Type",
            "Quantity",
            "CreatedAt",
            "IsActive",
            "CompanyId",
            "LineId",
            "WarehouseId",
            "StatusId"
        ) VALUES (
            picklist_name,
            CASE WHEN i % 2 = 0 THEN 'Production' ELSE 'Expédition' END,
            50 + FLOOR(RANDOM() * 200),
            NOW() - ((i * 2) || ' days')::INTERVAL,
            true,
            company_id,
            line_id,
            warehouse_id,
            status_id
        );
    END LOOP;
    
    RAISE NOTICE 'Created 12 picklists';
END $$;

-- ============================================================================
-- SECTION 3: DETAIL PICKLISTS
-- ============================================================================
DO $$
DECLARE
    picklist_rec RECORD;
    article_id INT;
    num_details INT;
    j INT;
    detail_status_id INT;
    company_id INT := 1;
BEGIN
    -- Get status for details
    SELECT "Id" INTO detail_status_id FROM "Status" WHERE "Description" = 'En cours' AND "Type" = 'DetailPicklist' LIMIT 1;
    
    IF detail_status_id IS NULL THEN
        SELECT "Id" INTO detail_status_id FROM "Status" LIMIT 1;
    END IF;
    
    FOR picklist_rec IN 
        SELECT "Id" FROM "Picklists" 
        WHERE "CompanyId" = company_id AND "Name" LIKE 'PICK-TEST%' 
    LOOP
        num_details := 3 + FLOOR(RANDOM() * 6);
        
        FOR j IN 1..num_details LOOP
            SELECT "Id" INTO article_id FROM "Articles" 
            WHERE "CompanyId" = company_id AND "CodeProduit" LIKE 'TEST-%'
            ORDER BY RANDOM() LIMIT 1;
            
            INSERT INTO "DetailPicklists" (
                "Emplacement",
                "Quantite",
                "ArticleId",
                "PicklistId",
                "StatusId",
                "CompanyId",
                "IsActive",
                "CreatedAt"
            ) VALUES (
                'A-' || LPAD((FLOOR(RANDOM() * 20) + 1)::TEXT, 2, '0') || '-' || LPAD((FLOOR(RANDOM() * 50) + 1)::TEXT, 2, '0'),
                5 + FLOOR(RANDOM() * 45),
                article_id,
                picklist_rec."Id",
                detail_status_id,
                company_id,
                true,
                NOW() - (RANDOM() * INTERVAL '15 days')
            );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Created picklist details';
END $$;

-- ============================================================================
-- SECTION 4: MOVEMENT TRACES
-- ============================================================================
DO $$
DECLARE
    detail_rec RECORD;
    user_id INT;
    num_movements INT;
    movement_date TIMESTAMP;
    i INT;
    company_id INT := 1;
    detail_picklist_id INT;
BEGIN
    SELECT "Id" INTO user_id FROM "Users" WHERE "CompanyId" = company_id LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: No users found. Please create at least 1 User first';
    END IF;
    
    FOR detail_rec IN 
        SELECT "Id", "Quantite" 
        FROM "DetailPicklists" 
        WHERE "CompanyId" = company_id 
        LIMIT 100 
    LOOP
        num_movements := 1 + FLOOR(RANDOM() * 3);
        
        FOR i IN 1..num_movements LOOP
            IF RANDOM() < 0.7 THEN
                movement_date := NOW() - (RANDOM() * INTERVAL '7 days');
            ELSE
                movement_date := NOW() - (7 + RANDOM() * 23) * INTERVAL '1 day';
            END IF;
            
            INSERT INTO "MovementTraces" (
                "UsNom",
                "DateMouvement",
                "Quantite",
                "UserId",
                "DetailPicklistId",
                "IsActive",
                "CompanyId",
                "CreatedAt"
            ) VALUES (
                'US-' || LPAD((FLOOR(RANDOM() * 10) + 1)::TEXT, 3, '0'),
                movement_date,
                1 + FLOOR(RANDOM() * 20),
                user_id,
                detail_rec."Id",
                true,
                company_id,
                movement_date
            );
        END LOOP;
    END LOOP;
    
    -- Add today's movements
    FOR i IN 1..20 LOOP
        SELECT "Id" INTO detail_picklist_id FROM "DetailPicklists" 
        WHERE "CompanyId" = company_id 
        ORDER BY RANDOM() LIMIT 1;
        
        IF detail_picklist_id IS NOT NULL THEN
            INSERT INTO "MovementTraces" (
                "UsNom",
                "DateMouvement",
                "Quantite",
                "UserId",
                "DetailPicklistId",
                "IsActive",
                "CompanyId",
                "CreatedAt"
            ) VALUES (
                'US-' || LPAD((FLOOR(RANDOM() * 10) + 1)::TEXT, 3, '0'),
                NOW() - (RANDOM() * INTERVAL '12 hours'),
                1 + FLOOR(RANDOM() * 15),
                user_id,
                detail_picklist_id,
                true,
                company_id,
                NOW()
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Created movement traces';
END $$;

-- ============================================================================
-- SECTION 5: RETURN LINES
-- ============================================================================
DO $$
DECLARE
    i INT;
    article_id INT;
    user_id INT;
    status_id INT;
    picklist_id INT;
    company_id INT := 1;
BEGIN
    SELECT "Id" INTO user_id FROM "Users" WHERE "CompanyId" = company_id LIMIT 1;
    
    FOR i IN 1..15 LOOP
        SELECT "Id" INTO article_id FROM "Articles" 
        WHERE "CompanyId" = company_id AND "CodeProduit" LIKE 'TEST-%'
        ORDER BY RANDOM() LIMIT 1;
        
        SELECT "Id" INTO picklist_id FROM "Picklists" 
        WHERE "CompanyId" = company_id AND "Name" LIKE 'PICK-TEST%'
        ORDER BY RANDOM() LIMIT 1;
        
        IF i <= 8 THEN
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'En cours' AND "Type" = 'ReturnLine' LIMIT 1;
        ELSIF i <= 12 THEN
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'Traité' AND "Type" = 'ReturnLine' LIMIT 1;
        ELSE
            SELECT "Id" INTO status_id FROM "Status" WHERE "Description" = 'Rejeté' AND "Type" = 'ReturnLine' LIMIT 1;
        END IF;
        
        IF status_id IS NULL THEN
            SELECT "Id" INTO status_id FROM "Status" LIMIT 1;
        END IF;
        
        INSERT INTO "ReturnLines" (
            "DateRetour",
            "Quantite",
            "UsCode",
            "ArticleId",
            "UserId",
            "StatusId",
            "PicklistId",
            "CompanyId",
            "IsActive",
            "CreatedAt"
        ) VALUES (
            NOW() - ((RANDOM() * 15) || ' days')::INTERVAL,
            1 + FLOOR(RANDOM() * 10),
            'US-RET-' || LPAD(i::TEXT, 4, '0'),
            article_id,
            user_id,
            status_id,
            picklist_id,
            company_id,
            true,
            NOW() - ((RANDOM() * 15) || ' days')::INTERVAL
        );
    END LOOP;
    
    RAISE NOTICE 'Created 15 return lines';
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Test Articles
SELECT COUNT(*) as "TotalTestArticles" FROM "Articles" WHERE "CodeProduit" LIKE 'TEST-%';

-- 2. Active Picklists
SELECT COUNT(*) as "ActivePicklists"
FROM "Picklists" p
JOIN "Status" s ON p."StatusId" = s."Id"
WHERE s."Description" = 'Active' AND s."Type" = 'Picklist';

-- 3. Returns In Progress
SELECT COUNT(*) as "ReturnsInProgress"
FROM "ReturnLines" rl
JOIN "Status" s ON rl."StatusId" = s."Id"
WHERE s."Description" = 'En cours' AND s."Type" = 'ReturnLine';

-- 4. Today's Movements
SELECT 
    DATE("DateMouvement") as "Date",
    COUNT(*) as "TotalMovements",
    SUM("Quantite") as "TotalQuantity"
FROM "MovementTraces"
WHERE DATE("DateMouvement") = CURRENT_DATE
GROUP BY DATE("DateMouvement");

-- 5. Last 7 Days Evolution
SELECT 
    DATE("DateMouvement") as "Date",
    COUNT(*) as "Movements",
    SUM("Quantite") as "TotalQuantity"
FROM "MovementTraces"
WHERE "DateMouvement" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE("DateMouvement")
ORDER BY "Date" DESC;

-- 6. Top 10 Articles
SELECT 
    a."CodeProduit",
    a."Designation",
    COUNT(mt."Id") as "MovementCount",
    SUM(mt."Quantite") as "TotalQuantity"
FROM "Articles" a
JOIN "DetailPicklists" dp ON dp."ArticleId" = a."Id"
JOIN "MovementTraces" mt ON mt."DetailPicklistId" = dp."Id"
WHERE a."CodeProduit" LIKE 'TEST-%'
GROUP BY a."Id", a."CodeProduit", a."Designation"
ORDER BY "MovementCount" DESC
LIMIT 10;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
