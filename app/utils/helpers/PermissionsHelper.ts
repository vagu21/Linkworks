import { Entity } from "@prisma/client";
import { AppOrAdminData } from "../data/useAppOrAdminData";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { RowPermissionsWithDetails } from "../db/permissions/rowPermissions.db.server";

export type PermissionType = "view" | "read" | "create" | "update" | "delete";

export function getEntityPermissions(entity: Entity): { name: string; description: string; type: PermissionType }[] {
  return [
    { type: "view", name: getEntityPermission(entity, "view"), description: `View ${entity.name} page` },
    { type: "read", name: getEntityPermission(entity, "read"), description: `View ${entity.name} records` },
    { type: "create", name: getEntityPermission(entity, "create"), description: `Create ${entity.name}` },
    { type: "update", name: getEntityPermission(entity, "update"), description: `Update ${entity.name}` },
    { type: "delete", name: getEntityPermission(entity, "delete"), description: `Delete ${entity.name}` },
  ];
}

export function getAllowedEntityPermissions(entity: Entity, allowedType: PermissionType[]) {
  const allCRUDPermissions = getEntityPermissions(entity);
  return allCRUDPermissions.filter((permission) => allowedType.includes(permission.type));
}

export function getEntityPermission(entity: { name: string }, permission: PermissionType): DefaultPermission {
  return `entity.${entity.name}.${permission}` as DefaultPermission;
}

export function getEntityPermissionsByName(name: string, permissions: PermissionType[]) {
  return permissions.map((permission) => ({
    type: permission,
    name: getEntityPermission({ name }, permission),
    description: `${permission.toUpperCase()} ${name}`,
  }));
}

export function getUserHasPermission(appOrAdminData: AppOrAdminData, permission: DefaultPermission) {
  if (permission.startsWith("entity.")) {
    return appOrAdminData.permissions.includes(permission);
  }
  if (appOrAdminData?.permissions === undefined) {
    return true;
  }
  if (appOrAdminData.isSuperAdmin) {
    return true;
  }
  return appOrAdminData.permissions.includes(permission);
}

export function getRowPermissionsObjects(permissions: RowPermissionsWithDetails[]) {
  return permissions
    .filter((f) => f !== null)
    .map((item) => {
      return {
        tenant: item.tenant ? { id: item.tenant.id, name: item.tenant.name } : null,
        role: item.role ? { id: item.role.id, name: item.role.name } : null,
        group: item.group ? { id: item.group.id, name: item.group.name } : null,
        user: item.user ? { id: item.user.id, email: item.user.email } : null,
      };
    })
    .filter((f) => f !== null);
}

export function getRowPermissionsDescription(
  permissions: {
    tenant: { id: string; name: string } | null;
    role: { id: string; name: string } | null;
    group: { id: string; name: string } | null;
    user: { id: string; email: string } | null;
  }[]
) {
  return permissions
    .filter((f) => f !== null)
    .map((item) => {
      if (item.tenant) {
        return `Account '${item.tenant.name}'`;
      } else if (item.role) {
        return `Role '${item.role.name}'`;
      } else if (item.group) {
        return `Group '${item.group.name}'`;
      } else if (item.user) {
        return `User '${item.user.email}'`;
      }
      return "";
    })
    .filter((f) => f !== null);
}
