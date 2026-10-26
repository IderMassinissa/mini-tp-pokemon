import express from "express";
import { Attack } from "./models/Attack";
import { Trainer } from "./models/Trainer";
import { pool, loadPokemon, loadTrainer, saveTrainerProgress } from "./db";
import { randomChallenge, arena1, deterministicChallenge, arena2 } from "./battle";

const app = express();
const port = 3000;

app.use(express.json());

// ===== Attaques =====

app.post("/attacks", async (req, res) => {
  const { name, damage, usageLimit } = req.body;
  const result = await pool.query(
    "INSERT INTO attacks (name, damage, usage_limit) VALUES ($1, $2, $3) RETURNING *",
    [name, damage, usageLimit]
  );
  res.json(result.rows[0]);
});

app.get("/attacks", async (req, res) => {
  const result = await pool.query("SELECT * FROM attacks");
  const attacks = result.rows.map((a) => new Attack(a.name, a.damage, a.usage_limit).toString());
  res.json(attacks);
});

// ===== Pokémon =====

app.post("/pokemons", async (req, res) => {
  const { name, lifePoint } = req.body;
  const result = await pool.query(
    "INSERT INTO pokemons (name, life_point) VALUES ($1, $2) RETURNING *",
    [name, lifePoint]
  );
  res.json(result.rows[0]);
});

app.get("/pokemons", async (req, res) => {
  const result = await pool.query("SELECT id FROM pokemons");
  const pokemons = [];
  for (const row of result.rows) {
    pokemons.push({ id: row.id, ...(await loadPokemon(row.id)) });
  }
  res.json(pokemons);
});

app.post("/pokemons/:id/attacks", async (req, res) => {
  const pokemonId = Number(req.params.id);
  const { attackId } = req.body;

  const pokemon = await loadPokemon(pokemonId);
  const result = await pool.query("SELECT * FROM attacks WHERE id = $1", [attackId]);
  if (!pokemon || result.rows.length === 0) {
    return res.status(404).json({ error: "Pokémon ou attaque introuvable" });
  }

  const row = result.rows[0];
  try {
    pokemon.learnAttack(new Attack(row.name, row.damage, row.usage_limit));
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }

  await pool.query("INSERT INTO pokemon_attacks (pokemon_id, attack_id) VALUES ($1, $2)", [
    pokemonId,
    attackId,
  ]);
  res.json(pokemon);
});

// ===== Dresseurs =====

app.post("/trainers", async (req, res) => {
  const { name } = req.body;
  const result = await pool.query("INSERT INTO trainers (name) VALUES ($1) RETURNING *", [name]);
  res.json(result.rows[0]);
});

app.get("/trainers", async (req, res) => {
  const result = await pool.query("SELECT id FROM trainers");
  const trainers = [];
  for (const row of result.rows) {
    trainers.push({ id: row.id, ...(await loadTrainer(row.id)) });
  }
  res.json(trainers);
});

app.post("/trainers/:id/pokemons", async (req, res) => {
  const trainerId = Number(req.params.id);
  const { pokemonId } = req.body;

  const trainer = await loadTrainer(trainerId);
  const pokemon = await loadPokemon(pokemonId);
  if (!trainer || !pokemon) {
    return res.status(404).json({ error: "Dresseur ou Pokémon introuvable" });
  }

  trainer.addPokemon(pokemon);
  await pool.query("UPDATE pokemons SET trainer_id = $1 WHERE id = $2", [trainerId, pokemonId]);
  res.json(trainer);
});

// ===== Combats =====

type Battle = (t1: Trainer, t2: Trainer) => Trainer | null;

function battleRoute(battle: Battle) {
  return async (req: express.Request, res: express.Response) => {
    const { trainer1Id, trainer2Id } = req.body;
    const t1 = await loadTrainer(trainer1Id);
    const t2 = await loadTrainer(trainer2Id);

    if (!t1 || !t2) {
      return res.status(404).json({ error: "Dresseur introuvable" });
    }
    if (t1.pokemons.length === 0 || t2.pokemons.length === 0) {
      return res.status(400).json({ error: "Chaque dresseur doit avoir au moins un Pokémon" });
    }

    const winner = battle(t1, t2);
    await saveTrainerProgress(trainer1Id, t1);
    await saveTrainerProgress(trainer2Id, t2);

    res.json({
      winner: winner ? winner.name : "égalité",
      trainers: [t1, t2].map((t) => ({ name: t.name, level: t.level, experience: t.experience })),
    });
  };
}

app.post("/battles/random", battleRoute(randomChallenge));
app.post("/battles/arena1", battleRoute(arena1));
app.post("/battles/deterministic", battleRoute(deterministicChallenge));
app.post("/battles/arena2", battleRoute(arena2));

app.listen(port, () => {
  console.log(`Pokemon API listening on port ${port}`);
});
