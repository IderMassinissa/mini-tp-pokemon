export class Attack {
  name: string;
  damage: number;
  usageLimit: number;
  usageCount: number = 0;

  constructor(name: string, damage: number, usageLimit: number) {
    this.name = name;
    this.damage = damage;
    this.usageLimit = usageLimit;
  }

  isAvailable(): boolean {
    return this.usageCount < this.usageLimit;
  }

  use(): void {
    this.usageCount++;
  }

  resetUsage(): void {
    this.usageCount = 0;
  }

  toString(): string {
    return `${this.name} - dégâts : ${this.damage} - usages : ${this.usageCount}/${this.usageLimit}`;
  }
}
