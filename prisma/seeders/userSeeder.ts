import { PrismaClient, Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();

const userPersonal: Prisma.UserCreateInput = {
  first_name: 'Personal',
  last_name: 'App',
  email: 'personal@example.com',
  password: hashSync('123456', 10) as string,
  roles: ['teacher', 'user'],
};

const userData: Prisma.UserCreateInput[] = [
  {
    first_name: 'User',
    last_name: 'One',
    email: 'user@example.com',
    password: hashSync('123456', 10) as string,
    roles: ['user'],
  },
];

const adminsData: Prisma.UserCreateInput[] = [
  {
    first_name: 'Paulo',
    last_name: 'Zancanaro',
    email: 'paulostoc@gmail.com',
    password: hashSync('123456', 10) as string,
    roles: ['teacher', 'user', 'admin'],
  },
  {
    first_name: 'Rafael',
    last_name: 'Sad',
    email: 'rafasad15@gmail.com',
    password: hashSync('123456', 10) as string,
    roles: ['teacher', 'user', 'admin'],
  },
];

async function userSeeder() {
  console.log(`Start seeding ...`);

  const personal = await prisma.user.create({
    data: userPersonal,
  });

  await Promise.all([
    userData.map(async (u) => {
      const user = await prisma.user.create({
        data: {
          ...u,
          teachers: {
            create: [
              {
                teacher_id: personal.id,
              },
            ],
          },
        },
      });
      return user;
    }),
    adminsData.map(async (u) => {
      const user = await prisma.user.create({
        data: {
          ...u,
        },
      });
      return user;
    }),
  ]);

  console.log(`Seeding finished.`);
}

export default userSeeder;
