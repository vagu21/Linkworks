import { db } from "../../db.server";

export async function isVisible(userId: any) {
  const userRoles = await db.userRole.findMany({
    where: {
      userId,
      role: {
        visible: true,
      },
    },
  });
  return userRoles.length > 0;
}

export async function getEntityNameById(entityId: any) {
  try {
    const entity = await db.entity.findUnique({
      where: { id: entityId },
      select: { name: true }
    });
    return entity ? entity.name : null;
  } catch (error) {
    return null;
  }
}
