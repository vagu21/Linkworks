import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import { createRolePermission } from "~/utils/db/permissions/rolePermissions.db.server";
import { getRoleByName } from "~/utils/db/permissions/roles.db.server";
import { getEntityPermissionsByName, PermissionType } from "~/utils/helpers/PermissionsHelper";
import { CreateRoleDto, defaultAppRoles } from "~/utils/services/rolesAndPermissionsService";

type TemplatePermissions = {
  inRoles: string[];
  name: string;
  description: string;
  type: string;
}

type SeedTemplateRolesArgs = {
  templateName: string;
  templatePermissions: TemplatePermissions[];
  templateSpecificRoles: string[];
}


type PermissionsConfig = {
	actions: PermissionType[],
	allRoles?: boolean,
	rolesFilter?: (role: CreateRoleDto) => boolean,
}

export const createEntityPermissions = (entityName: string, permissionConfig: PermissionsConfig[]) => {
	return permissionConfig.flatMap(({ actions, allRoles, rolesFilter }) => {
		const _rolesFilter = typeof allRoles !== 'undefined' && allRoles ? () => true : typeof rolesFilter === 'function' ? rolesFilter : () => false
		const roles = defaultAppRoles.filter((role) =>  _rolesFilter(role));
		return getEntityPermissionsByName(entityName, actions).map(o => ({
			inRoles: roles.map(role => role.name.toString()),
			name: o.name,
			description: o.description,
			type: 'app'
		}));
	});
};


export const excludeRoles = (excludedRoles: DefaultAppRoles[]) => (role: CreateRoleDto) => !excludedRoles.includes(role.name as DefaultAppRoles)

export const onlyRoles = (allowedRoles: DefaultAppRoles[]) => (role: CreateRoleDto)  => allowedRoles.includes(role.name as DefaultAppRoles)

export async function seedTemplateRoles({
  templateName,
  templatePermissions,
  templateSpecificRoles
}: SeedTemplateRolesArgs) {
  
  console.log(`🌱 Creating ${templateName} Role Permissions`);
  const createdRolePermisisons = [];

  const getEntityPermissionMapByRole = async (role: string)=> {
    const rolePermissionsMap = new Map(
      templatePermissions
      .filter((o) => o.inRoles.includes(role))
      .map((o) => [String(o.name), o])
    );
    return (await getAllPermissions()).filter(f => rolePermissionsMap.has(f.name));
  }

  await Promise.all(
		templateSpecificRoles.map(async role => {
			const dbRole = await getRoleByName(role);
			if(dbRole) {
				const rolePermissions = await getEntityPermissionMapByRole(role);
				await Promise.all(
					rolePermissions.map(async (permission) => {
						createdRolePermisisons.push(permission.name);
						return await createRolePermission({
							roleId: dbRole.id,
							permissionId: permission.id,
						});
					})
				);
			}
		})
	);

  console.log(`🌱 Created ${templateName} Role Permissions: ${createdRolePermisisons.length}`)
}