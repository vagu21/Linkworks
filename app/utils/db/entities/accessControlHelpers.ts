import { db } from "../../db.server";

// Function to check if any of the user's roles are visible
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

// Function to retrieve the entity name using its ID
async function getEntityNameById(entityId: any) {
  try {
    const entity = await db.entity.findUnique({
      where: { id: entityId },
      select: { name: true }
    });
    return entity ? entity.name : null;
  } catch (error) {
    // console.error("Error fetching entity name:", error);
    return null;
  }
}

// Function to determine access filters based on user roles and entity visibility
export async function getAccessFilters({ tenantId, userId, entityId }: any) {
  const entityName = entityId ? await getEntityNameById(entityId) : null;
  const visible = await isVisible(userId);
  const normalizedEntityName = entityName ? entityName.toLowerCase() : '';

  if (visible && normalizedEntityName === 'job') {
    return {}; // No restrictions for visible roles on the 'jobs' entity
  }

  if (visible) {
    return { createdByUserId: userId }; // Restrict access to rows created by the user if the role is visible
  }

  // Default filter for non-visible roles or if tenantId is specified
  const defaultFilters = tenantId ? { tenantId } : {};
  return defaultFilters;
}
