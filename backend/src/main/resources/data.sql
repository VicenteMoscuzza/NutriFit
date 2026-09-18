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
