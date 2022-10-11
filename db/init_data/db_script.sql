CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY, 
    brewery_name varchar(30),
    review varchar(500), 
    review_date DATE
);