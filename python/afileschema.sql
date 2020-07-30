DROP TABLE IF EXISTS audiofiles;

CREATE TABLE audiofiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filepath TEXT NOT NULL,
    fname TEXT NOT NULL,
    fhash TEXT NOT NULL    
);