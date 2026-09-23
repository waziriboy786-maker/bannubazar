import { prisma } from "../config/prisma";

export const categoryRepository = {
  findAll: () => prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  findById: (id: string) => prisma.category.findUnique({ where: { id } }),
  create: (data: { name: string; parentId?: string; image?: string }) => prisma.category.create({ data }),
  update: (id: string, data: Partial<{ name: string; parentId: string | null; image: string; status: string }>) =>
    prisma.category.update({ where: { id }, data }),
  remove: (id: string) => prisma.category.delete({ where: { id } }),
};
