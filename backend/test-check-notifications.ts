import { prisma } from "./src/config/prisma";

async function main() {
  // Lấy user đầu tiên (giả sử là user đang login)
  const user = await prisma.user.findFirst({
    select: { userId: true, email: true, fullName: true }
  });

  if (!user) {
    console.log("No user found!");
    return;
  }

  console.log("User:", user);

  // Lấy notifications của user này
  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`Found ${notifications.length} notifications for user ${user.userId}:`);
  notifications.forEach(n => {
    console.log(`  - [${n.type}] ${n.title} (${n.status}) at ${n.createdAt}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
