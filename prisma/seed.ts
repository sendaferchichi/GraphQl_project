/// <reference types="node" />
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'aymen@gmail.com' },
    update: {},
    create: {
      name: 'Aymen',
      email: 'aymen@gmail.com',
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRole.USER,
    },
  });

  const graphqlSkill = await prisma.skill.upsert({
    where: { designation: 'GraphQL' },
    update: {},
    create: { designation: 'GraphQL' },
  });

  const nodeSkill = await prisma.skill.upsert({
    where: { designation: 'NodeJS' },
    update: {},
    create: { designation: 'NodeJS' },
  });

  const reactSkill = await prisma.skill.upsert({
    where: { designation: 'React' },
    update: {},
    create: { designation: 'React' },
  });

  await prisma.cv.upsert({
    where: { id: 'seed-cv-1' },
    update: {
      name: 'FullStack Developer',
      age: 41,
      job: 'Freelancer',
      owner: { connect: { id: admin.id } },
      skills: { set: [{ id: graphqlSkill.id }, { id: nodeSkill.id }] },
    },
    create: {
      id: 'seed-cv-1',
      name: 'FullStack Developer',
      age: 41,
      job: 'Freelancer',
      owner: { connect: { id: admin.id } },
      skills: { connect: [{ id: graphqlSkill.id }, { id: nodeSkill.id }] },
    },
  });

  await prisma.cv.upsert({
    where: { id: 'seed-cv-2' },
    update: {
      name: 'Frontend Junior',
      age: 22,
      job: 'Intern',
      owner: { connect: { id: user.id } },
      skills: { set: [{ id: reactSkill.id }] },
    },
    create: {
      id: 'seed-cv-2',
      name: 'Frontend Junior',
      age: 22,
      job: 'Intern',
      owner: { connect: { id: user.id } },
      skills: { connect: [{ id: reactSkill.id }] },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
