import { prisma } from "./src/config/prisma";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "tptnhan23@clc.fitus.edu.vn" }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.userId, status: "Unread" }
  });

  console.log(JSON.stringify({
    success: true,
    notifications: notifications.map(n => ({
      notificationId: n.notificationId,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      status: n.status,
      createdAt: n.createdAt
    })),
    unreadCount,
    pagination: {
      page: 1,
      pageSize: 20,
      total: notifications.length,
      totalPages: 1
    }
  }, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
