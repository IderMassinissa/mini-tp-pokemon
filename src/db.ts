import { Pool } from "pg";
import { Attack } from "./models/Attack";
import { Pokemon } from "./models/Pokemon";
import { Trainer } from "./models/Trainer";

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: process.env.dbuser,
  password: process.env.dbpwd,
  database: "pokemon",
});

export async function loadPokemon(id: number): Promise<Pokemon | null> {
  const result = await pool.query("SELECT * FROM pokemons WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows[0];
  const pokemon = new Pokemon(row.name, row.life_point);

  const attacks = await pool.query(
    `SELECT a.* FROM attacks a
     JOIN pokemon_attacks pa ON pa.attack_id = a.id
     WHERE pa.pokemon_id = $1`,
    [id]
  );
  attacks.rows.forEach((a) => {
    pokemon.learnAttack(new Attack(a.name, a.damage, a.usage_limit));
  });
  return pokemon;
}

export async function loadTrainer(id: number): Promise<Trainer | null> {
  const result = await pool.query("SELECT * FROM trainers WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows[0];
  const trainer = new Trainer(row.name, row.level, row.experience);

  const pokemons = await pool.query("SELECT id FROM pokemons WHERE trainer_id = $1", [id]);
  for (const p of pokemons.rows) {
    const pokemon = await loadPokemon(p.id);
    if (pokemon) {
      trainer.addPokemon(pokemon);
    }
  }
  return trainer;
}

export async function saveTrainerProgress(id: number, trainer: Trainer): Promise<void> {
  await pool.query("UPDATE trainers SET level = $1, experience = $2 WHERE id = $3", [
    trainer.level,
    trainer.experience,
    id,
  ]);
}
