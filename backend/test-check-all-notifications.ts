import { prisma } from "./src/config/prisma";

async function main() {
  // Lấy TẤT CẢ notifications
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log(`Total notifications in DB: ${notifications.length}`);
  notifications.forEach(n => {
    console.log(`  [${n.notificationId}] user=${n.userId} [${n.type}] ${n.title} (${n.status}) at ${n.createdAt}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
