import type { NewUser, User } from '../../../../src/api/src/db/schema.js';

export class InMemoryUsersRepository {
  readonly items: User[] = [];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.items.find((user) => user.email === email);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.items.find((user) => user.id === id);
  }

  async create(user: NewUser): Promise<User> {
    const created: User = { id: this.items.length + 1, rating: 1000, createdAt: new Date(), ...user };
    this.items.push(created);
    return created;
  }
}
