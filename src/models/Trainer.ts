import { Pokemon } from "./Pokemon";

export class Trainer {
  name: string;
  level: number;
  experience: number;
  pokemons: Pokemon[] = [];

  constructor(name: string, level: number = 1, experience: number = 0) {
    this.name = name;
    this.level = level;
    this.experience = experience;
  }

  addPokemon(pokemon: Pokemon): void {
    this.pokemons.push(pokemon);
  }

  healAtTavern(): void {
    this.pokemons.forEach((pokemon) => pokemon.heal());
  }

  gainExperience(points: number): void {
    this.experience += points;
    while (this.experience >= 10) {
      this.level++;
      this.experience -= 10;
    }
  }

  hasPokemonAlive(): boolean {
    return this.pokemons.some((pokemon) => !pokemon.isKO());
  }
}
