-- Create database
CREATE DATABASE IF NOT EXISTS chan;

ALTER DATABASE chan CHARACTER SET utf8 COLLATE utf8_general_ci;

USE chan;

CREATE TABLE IF NOT EXISTS posts (
	postId INTEGER AUTO_INCREMENT,
	msg varchar(2000), 
	img varchar(2000), 
	time DATETIME DEFAULT NOW(), 
	PRIMARY KEY (postId)
) engine=innodb;

ALTER TABLE posts CHARACTER SET utf8 COLLATE utf8_general_ci;