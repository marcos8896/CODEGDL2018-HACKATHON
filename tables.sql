CREATE DATABASE IF NOT EXISTS codegdl_gases;
USE codegdl_gases;
-- SET default_storage_engine=INNODB;
DROP TABLE IF EXISTS emisiones;
CREATE TABLE emisiones (
    ID INT NOT NULL AUTO_INCREMENT,
    FECHA VARCHAR(200) ,
    CLAVE_EST VARCHAR(50),
    PARAMETRO VARCHAR(50),
    HORA01 FLOAT,
    HORA02 FLOAT,
    HORA03 FLOAT,
    HORA04 FLOAT,
    HORA05 FLOAT,
    HORA06 FLOAT,
    HORA07 FLOAT,
    HORA08 FLOAT,
    HORA09 FLOAT,
    HORA10 FLOAT,
    HORA11 FLOAT,
    HORA12 FLOAT,
    HORA13 FLOAT,
    HORA14 FLOAT,
    HORA15 FLOAT,
    HORA16 FLOAT,
    HORA17 FLOAT,
    HORA18 FLOAT,
    HORA19 FLOAT,
    HORA20 FLOAT,
    HORA21 FLOAT,
    HORA22 FLOAT,
    HORA23 FLOAT,
    HORA24 FLOAT,
    PRIMARY KEY (ID)
);