import { prisma } from "../prisma";

export class TodoService {
    async getAll() {
        return prisma.todo.findMany();
    }

    async create(title: string) {
        return prisma.todo.create({ data: { title } });
    }

    async update(id: string, completed: boolean) {
        return prisma.todo.update({
            where: { id },
            data: { completed },
        });
    }

    async delete(id: string) {
        return prisma.todo.delete({ where: { id } });
    }
}
