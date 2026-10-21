-- Schema for the forum. docker-compose.yml loads this automatically on first start.
-- Manual use: psql "$DATABASE_URL" -f server/schema.sql

CREATE TABLE users (
	user_id SERIAL Primary key,
	username text unique NOT NULL,
	password text NOT NULL
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name TEXT NOT NULL
);

CREATE TABLE threads (
	thread_id SERIAL Primary key,
	op_id SERIAL REFERENCES users(user_id),
	thread_title TEXT NOT NULL,
	thread_info TEXT NOT NULL,
	thread_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	category_id INT REFERENCES categories(category_id)
);

CREATE TABLE comments (
	comment_id SERIAL Primary key,
	thread_id SERIAL references threads(thread_id),
	commenter_id SERIAL references users(user_id),
	comment_info TEXT NOT NULL,
	comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (category_name) VALUES
('English'),
('Mathematics'),
('Science'),
('Chinese'),
('Malay'),
('Tamil'),
('History'),
('Geography'),
('Literature'),
('Others');
