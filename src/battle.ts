import { Pokemon } from "./models/Pokemon";
import { Trainer } from "./models/Trainer";

// Combat entre deux Pokémon, chacun attaque à son tour.
// Un Pokémon sans attaque disponible perd le combat.
function fight(p1: Pokemon, p2: Pokemon): Pokemon {
  let attacker = p1;
  let defender = p2;
  while (true) {
    if (!attacker.attack(defender)) {
      return defender;
    }
    if (defender.isKO()) {
      return attacker;
    }
    [attacker, defender] = [defender, attacker];
  }
}

function randomPokemon(trainer: Trainer): Pokemon {
  return trainer.pokemons[Math.floor(Math.random() * trainer.pokemons.length)];
}

function strongestPokemon(trainer: Trainer): Pokemon {
  return trainer.pokemons
    .filter((pokemon) => !pokemon.isKO())
    .reduce((best, pokemon) => (pokemon.lifePoint > best.lifePoint ? pokemon : best));
}

function duel(t1: Trainer, t2: Trainer, p1: Pokemon, p2: Pokemon): Trainer {
  const winner = fight(p1, p2) === p1 ? t1 : t2;
  winner.gainExperience(1);
  return winner;
}

// Plus haut niveau, puis plus d'expérience. null en cas d'égalité parfaite.
function bestTrainer(t1: Trainer, t2: Trainer): Trainer | null {
  if (t1.level !== t2.level) {
    return t1.level > t2.level ? t1 : t2;
  }
  if (t1.experience !== t2.experience) {
    return t1.experience > t2.experience ? t1 : t2;
  }
  return null;
}

export function randomChallenge(t1: Trainer, t2: Trainer): Trainer {
  t1.healAtTavern();
  t2.healAtTavern();
  return duel(t1, t2, randomPokemon(t1), randomPokemon(t2));
}

export function arena1(t1: Trainer, t2: Trainer): Trainer | null {
  for (let i = 0; i < 100; i++) {
    randomChallenge(t1, t2);
  }
  return bestTrainer(t1, t2);
}

export function deterministicChallenge(t1: Trainer, t2: Trainer): Trainer {
  return duel(t1, t2, strongestPokemon(t1), strongestPokemon(t2));
}

export function arena2(t1: Trainer, t2: Trainer): Trainer | null {
  for (let i = 0; i < 100; i++) {
    if (!t1.hasPokemonAlive()) return t2;
    if (!t2.hasPokemonAlive()) return t1;
    deterministicChallenge(t1, t2);
  }
  if (!t1.hasPokemonAlive()) return t2;
  if (!t2.hasPokemonAlive()) return t1;
  return bestTrainer(t1, t2);
}
