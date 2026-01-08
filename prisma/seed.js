const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function sentence(words = 12) {
  const dict = [
    "conference",
    "workshop",
    "meetup",
    "summit",
    "expo",
    "festival",
    "web",
    "cloud",
    "ai",
    "data",
    "design",
    "product",
    "growth",
    "security",
    "blockchain",
    "mobile",
    "frontend",
    "backend",
    "devops",
    "testing",
    "monitoring",
    "ux",
    "ui",
    "marketing",
    "finance",
  ];
  const arr = Array.from(
    { length: words },
    () => dict[Math.floor(Math.random() * dict.length)]
  );
  arr[0] = arr[0][0].toUpperCase() + arr[0].slice(1);
  return arr.join(" ") + ".";
}

function title() {
  const prefixes = [
    "MeraEvent",
    "City",
    "Global",
    "Future",
    "Next",
    "Neo",
    "Classic",
    "Cloud",
    "Data",
    "Design",
    "Dev",
  ];
  const topics = [
    "Summit",
    "Conf",
    "Meetup",
    "Workshop",
    "Expo",
    "Festival",
    "Hackday",
    "Forum",
  ];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
    topics[Math.floor(Math.random() * topics.length)]
  }`;
}

const cities = [
  "New York",
  "San Francisco",
  "Chicago",
  "Austin",
  "Seattle",
  "London",
  "Berlin",
  "Toronto",
  "Dubai",
  "Singapore",
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  const demoPassword = await bcrypt.hash("demo1234", 10);

  const users = [];
  for (let i = 1; i <= 30; i++) {
    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      passwordHash: demoPassword,
    });
  }

  await prisma.user.createMany({ data: users });
  const allUsers = await prisma.user.findMany();

  console.log("Seeding events...");
  const now = new Date();
  const nextYear = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  );
  const events = [];
  for (let i = 1; i <= 120; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    events.push({
      title: title(),
      description: sentence(24),
      date: randomDate(now, nextYear),
      capacity: Math.floor(Math.random() * 150) + 20,
      venue: `${city} Convention Center`,
      createdById: creator.id,
    });
  }

  await prisma.event.createMany({ data: events });

  console.log("Seed complete - users start with zero bookings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
