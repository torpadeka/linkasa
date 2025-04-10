-- Create the database if it doesn’t exist
CREATE DATABASE IF NOT EXISTS linkasa;

-- Create the user if it doesn’t exist (optional, since MYSQL_USER already does this)
CREATE USER IF NOT EXISTS 'torpadeka'@'%' IDENTIFIED BY 'torpadeka';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON linkasa.* TO 'torpadeka'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;