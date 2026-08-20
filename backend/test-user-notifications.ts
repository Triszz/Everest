import { prisma } from "./src/config/prisma";

async function main() {
  // Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email: "tptnhan23@clc.fitus.edu.vn" },
    select: { userId: true, email: true, fullName: true }
  });

  console.log("User tptnhan23:", user);

  if (user) {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Notifications: ${notifications.length}`);
    notifications.forEach(n => {
      console.log(`  - [${n.type}] ${n.title}`);
    });
  }

  // Check user đang có notification
  const userWithNotif = await prisma.user.findUnique({
    where: { email: "d39f9c12-80fc-49c8-bd13-ca256c96676f" as any },
    select: { userId: true, email: true }
  }).catch(() => null);

  if (!userWithNotif) {
    // userId này có thể là một user khác
    const anyUser = await prisma.user.findFirst({
      where: { userId: "d39f9c12-80fc-49c8-bd13-ca256c96676f" as any },
      select: { userId: true, email: true, fullName: true }
    });
    console.log("User có notification:", anyUser);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
