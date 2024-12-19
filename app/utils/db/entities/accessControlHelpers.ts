import { db } from "../../db.server";


export async function isUserSupplier(userId:any) {
      const userRoles = await db.userRole.findMany({
        where: {
          userId,
          role: {
            name: 'supplier',
          },
        },
      });
      return userRoles.length > 0;
    }

async function getEntityNameById(entityId:any) {
    try {
      const entity = await db.entity.findUnique({
        where: { id: entityId },
        select: { name: true }
      });
      return entity ? entity.name : null;
    } catch (error) {
      console.error("Error fetching entity name:", error);
      return null;
    }
  }
export async function getAccessFilters({ tenantId, userId, entityId }:any) {
//   console.log(`Access Filter Request: TenantID: ${tenantId}, UserID: ${userId}, EntityID: ${entityId}`);

  // Retrieve the entity name using the ID provided
  const entityName = entityId ? await getEntityNameById(entityId) : null;
//   console.log(`Entity Name: ${entityName}`);

  const isSupplier = await isUserSupplier(userId);
//   console.log(`Is user a supplier? ${isSupplier}`);

  // Normalize entity name for comparison if it's not null or undefined
  const normalizedEntityName = entityName ? entityName.toLowerCase() : '';
//   console.log("Normalized Entity Name:", normalizedEntityName);

  // Special handling for 'jobs' entity name assuming 'jobs' is the correct name to check
  if (isSupplier && normalizedEntityName === 'job') {
    // console.log('Supplier accessing Jobs entity, no restrictions applied.');
    return {}; // No restrictions for suppliers on the 'jobs' entity
  }
  

  if (isSupplier) {
    // console.log('Supplier accessing non-jobs entity or undefined entity name, restricting to own rows.');
    return { createdByUserId: userId }; // Restrict access to rows created by the supplier
  }

  // Default filter for non-suppliers or if tenantId is specified
  const defaultFilters = tenantId ? { tenantId } : {};
//   console.log(`Default filters applied: ${JSON.stringify(defaultFilters)}`);
  return defaultFilters;
}

