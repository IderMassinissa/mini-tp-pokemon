import { Attack } from "./Attack";

export class Pokemon {
  name: string;
  lifePoint: number;
  maxLifePoint: number;
  attacks: Attack[] = [];

  constructor(name: string, lifePoint: number) {
    this.name = name;
    this.lifePoint = lifePoint;
    this.maxLifePoint = lifePoint;
  }

  learnAttack(attack: Attack): void {
    if (this.attacks.length >= 4) {
      throw new Error("Un Pokémon ne peut pas avoir plus de 4 attaques");
    }
    if (this.attacks.some((a) => a.name === attack.name)) {
      throw new Error("Ce Pokémon connaît déjà cette attaque");
    }
    this.attacks.push(attack);
  }

  heal(): void {
    this.lifePoint = this.maxLifePoint;
    this.attacks.forEach((attack) => attack.resetUsage());
  }

  isKO(): boolean {
    return this.lifePoint <= 0;
  }

  // Attaque la cible avec une attaque disponible choisie au hasard.
  // Renvoie false si plus aucune attaque n'est disponible.
  attack(target: Pokemon): boolean {
    const available = this.attacks.filter((a) => a.isAvailable());
    if (available.length === 0) {
      return false;
    }
    const attack = available[Math.floor(Math.random() * available.length)];
    attack.use();
    target.lifePoint -= attack.damage;
    return true;
  }
}
