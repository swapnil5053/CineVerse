-- Add more movies to support the extended show schedule
USE theatre_db;

INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status) VALUES
-- Action Movies
('Thunder Strike', 145, 'Action', 'English', 8.2, '2025-11-15', 'now_showing'),
('Speed Demon', 132, 'Action', 'Hindi', 7.8, '2025-11-20', 'now_showing'),
('Night Hunter', 128, 'Action', 'English', 8.0, '2025-11-25', 'now_showing'),
('Fire Storm', 140, 'Action', 'Hindi', 7.9, '2025-12-01', 'now_showing'),
('Steel Force', 135, 'Action', 'English', 8.1, '2025-12-05', 'now_showing'),

-- Drama Movies
('Heart Strings', 155, 'Drama', 'Hindi', 8.5, '2025-11-10', 'now_showing'),
('Silent Tears', 142, 'Drama', 'English', 8.3, '2025-11-18', 'now_showing'),
('Family Bonds', 138, 'Drama', 'Hindi', 7.7, '2025-11-22', 'now_showing'),
('Lost Dreams', 148, 'Drama', 'English', 8.0, '2025-12-03', 'now_showing'),
('Golden Years', 152, 'Drama', 'Hindi', 8.2, '2025-12-08', 'now_showing'),

-- Comedy Movies
('Laugh Riot', 125, 'Comedy', 'Hindi', 7.5, '2025-11-12', 'now_showing'),
('Funny Business', 118, 'Comedy', 'English', 7.3, '2025-11-16', 'now_showing'),
('Comedy Central', 122, 'Comedy', 'Hindi', 7.6, '2025-11-28', 'now_showing'),
('Hilarious Times', 115, 'Comedy', 'English', 7.4, '2025-12-02', 'now_showing'),
('Joke Factory', 120, 'Comedy', 'Hindi', 7.8, '2025-12-10', 'now_showing'),

-- Romance Movies
('Love Story', 135, 'Romance', 'Hindi', 8.1, '2025-11-14', 'now_showing'),
('Eternal Love', 142, 'Romance', 'English', 7.9, '2025-11-21', 'now_showing'),
('Sweet Romance', 128, 'Romance', 'Hindi', 7.7, '2025-11-26', 'now_showing'),
('Perfect Match', 133, 'Romance', 'English', 8.0, '2025-12-06', 'now_showing'),
('True Love', 140, 'Romance', 'Hindi', 8.2, '2025-12-12', 'now_showing'),

-- Sci-Fi Movies
('Space Odyssey', 165, 'Sci-Fi', 'English', 8.7, '2025-11-08', 'now_showing'),
('Future World', 158, 'Sci-Fi', 'Hindi', 8.4, '2025-11-19', 'now_showing'),
('Cyber Wars', 150, 'Sci-Fi', 'English', 8.3, '2025-11-24', 'now_showing'),
('Time Travel', 145, 'Sci-Fi', 'Hindi', 8.1, '2025-12-04', 'now_showing'),
('Galaxy Quest', 155, 'Sci-Fi', 'English', 8.5, '2025-12-09', 'now_showing'),

-- Horror Movies
('Dark Shadows', 125, 'Horror', 'English', 7.2, '2025-11-13', 'now_showing'),
('Nightmare', 118, 'Horror', 'Hindi', 7.0, '2025-11-17', 'now_showing'),
('Haunted House', 122, 'Horror', 'English', 7.3, '2025-11-29', 'now_showing'),
('Ghost Story', 115, 'Horror', 'Hindi', 7.1, '2025-12-07', 'now_showing'),
('Terror Night', 128, 'Horror', 'English', 7.4, '2025-12-11', 'now_showing'),

-- Thriller Movies
('Mind Games', 138, 'Thriller', 'English', 8.0, '2025-11-11', 'now_showing'),
('Suspense', 142, 'Thriller', 'Hindi', 7.8, '2025-11-23', 'now_showing'),
('Mystery Box', 135, 'Thriller', 'English', 7.9, '2025-11-27', 'now_showing'),
('Hidden Truth', 140, 'Thriller', 'Hindi', 8.1, '2025-12-13', 'now_showing'),
('Final Twist', 145, 'Thriller', 'English', 8.2, '2025-12-15', 'now_showing');