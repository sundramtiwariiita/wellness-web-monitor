CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(50) NOT NULL,
    mobile BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    age INT NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS testing (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    time DATETIME NOT NULL,
    result VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_testing_email (email)
);
