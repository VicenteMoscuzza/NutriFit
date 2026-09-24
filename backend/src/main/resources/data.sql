INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Press banca', 'Pecho', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press banca' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Sentadilla', 'Piernas', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Sentadilla' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Peso muerto', 'Espalda', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Peso muerto' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Press militar', 'Hombros', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press militar' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Dominadas', 'Espalda', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Dominadas' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Curl de bíceps', 'Brazos', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Curl de bíceps' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Extensión de tríceps', 'Brazos', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Extensión de tríceps' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Zancadas', 'Piernas', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Zancadas' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Plancha', 'Core', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Plancha' AND is_global = true);

INSERT INTO exercises (name, muscle_group, is_global)
SELECT 'Remo con barra', 'Espalda', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo con barra' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Pechuga de pollo', 165, 31, 0, 3.6, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Pechuga de pollo' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Arroz blanco cocido', 130, 2.7, 28, 0.3, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Arroz blanco cocido' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Huevo', 155, 13, 1.1, 11, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Huevo' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Avena', 389, 16.9, 66, 6.9, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Avena' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Banana', 89, 1.1, 23, 0.3, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Banana' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Palta', 160, 2, 8.5, 14.7, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Palta' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Yogur natural', 61, 3.5, 4.7, 3.3, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Yogur natural' AND is_global = true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_global)
SELECT 'Almendras', 579, 21, 22, 50, true
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = 'Almendras' AND is_global = true);
