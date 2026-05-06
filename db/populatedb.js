#! populatedb.js

const { Client } = require("pg");
require("dotenv").config();

const SQL = `
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR ( 255 ) NOT NULL,
  last_name VARCHAR ( 255 ) NOT NULL,
  username VARCHAR ( 255 ) UNIQUE NOT NULL,
  password VARCHAR ( 255 ) NOT NULL,
  membership BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE
);

INSERT INTO users (first_name, last_name, username, password, membership, is_admin) 
VALUES
  ('Amando', 'Garcia', 'amando', 'password123', TRUE, TRUE),
  ('Charles', 'Johnson', 'charles', 'password456', FALSE, FALSE);

  CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
  INSERT INTO posts (user_id, content)
  VALUES
    (1, 'Hello, this is Amando''s first post!'),
    (2, 'Hi everyone, Charles here with my first post!');
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();