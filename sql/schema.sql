CREATE DATABASE pokemon;
\c pokemon;

CREATE TABLE trainers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE attacks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  damage INTEGER NOT NULL,
  usage_limit INTEGER NOT NULL
);

CREATE TABLE pokemons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  life_point INTEGER NOT NULL,
  trainer_id INTEGER REFERENCES trainers(id)
);

CREATE TABLE pokemon_attacks (
  pokemon_id INTEGER REFERENCES pokemons(id),
  attack_id INTEGER REFERENCES attacks(id),
  PRIMARY KEY (pokemon_id, attack_id)
);
