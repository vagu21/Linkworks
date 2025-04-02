import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { importEntitiesFromTemplate } from "~/utils/services/.server/entitiesTemplatesService";
import { CreatePermissionDto } from "~/utils/services/rolesAndPermissionsService";
import { createEntityPermissions, excludeRoles, onlyRoles, seedTemplateRoles } from "../../utils/helpers";
import EntitiesJson from "./entities.json";
import { EntitiesTemplateDto } from "~/modules/templates/EntityTemplateDto";
import { createEntityGroup, getAllEntityGroups } from "~/utils/db/entities/entityGroups.db.server";

const createJobEntityPermissions = (): CreatePermissionDto[] => {
	return createEntityPermissions("Job", [
		{ actions: ["view", "read"], allRoles: true },
		{
			actions: ["create", "update", "delete"],
			rolesFilter: excludeRoles([DefaultAppRoles.Supplier, DefaultAppRoles.User]),
		},
	]);
};

const createCompanyEntityPermissions = () => {
	const basePermissions = [
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map((r) => r.toString()),
			name: "app.settings.companyMembers.view",
			description: "can view compnay memebers",
			type: "app",
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map((r) => r.toString()),
			name: "app.settings.companyMembers.create",
			description: "can add compnay memebers",
			type: "app",
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map((r) => r.toString()),
			name: "app.settings.companyMembers.update",
			description: "can remove compnay memebers",
			type: "app",
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map((r) => r.toString()),
			name: "app.settings.companyMembers.delete",
			description: "can remove compnay memebers",
			type: "app",
		},
	];
	return [
		...basePermissions,
		...createEntityPermissions("Account", [
			{
				actions: ["view", "read"],
				allRoles: true,
			},
			{
				actions: ["create", "update", "delete"],
				rolesFilter: onlyRoles([DefaultAppRoles.Admin, DefaultAppRoles.SuperUser]),
			},
		]),
	];
};

const createCandidatesEntityPermissions = () => {
	return createEntityPermissions("Candidate", [
		{
			actions: ["view", "read"],
			allRoles: true,
		},
		{
			actions: ["create", "update", "delete"],
			rolesFilter: excludeRoles([DefaultAppRoles.User]),
		},
	]);
};

const createContactsEntityPermissions = () => {
	return createEntityPermissions("Contact", [
		{
			actions: ["view", "read"],
			allRoles: true,
		},
		{
			actions: ["create", "update", "delete"],
			rolesFilter: excludeRoles([DefaultAppRoles.User]),
		},
	]);
};

const RECRUITMENT_CRM_PERMISSIONS = [
	...createJobEntityPermissions(),
	...createCompanyEntityPermissions(),
	...createCandidatesEntityPermissions(),
	...createContactsEntityPermissions(),
];

async function seedGroups(entities: any[]) {
	const recruitmentEntities = [ "Account",  "Candidate", "Job", "Job Application", "Employment Contract", "Contact"];
	const groups = [
		{
			slug: "recruitment",
			title: "Recruitment",
			icon: '<svg class="h-5 w-5 " xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="60" height="60" viewBox="0 0 30 30" fill="currentColor"><path d="M23.003 1.9939999999999998A4.003 4.003 0 1023.003 10 4.003 4.003 0 1023.003 1.9939999999999998zM24.012 19.137v-2.144h2c.4 0 .77-.24.92-.62.16-.37.07-.8-.21-1.09l-2.92-2.91c-.15-.2-.37-.34-.62-.38h-.33c-.25.04-.48.18-.63.38l-2.92 2.91c-.28.29-.37.72-.21 1.09.15.38.52.62.92.62h2v2.139C20.283 19.575 19 21.13 19 22.997 19 25.207 20.793 27 23.003 27c2.211 0 4.003-1.792 4.003-4.003C27.007 21.136 25.732 19.586 24.012 19.137zM13.721 20.283c-.29-.28-.72-.37-1.09-.21-.38.15-.62.52-.62.92v2h-1c-.002 0-.003.001-.005.001-.151-.001-2.991-.068-2.995-3.992V9.856c1.72-.449 2.995-1.999 2.995-3.86 0-2.211-1.792-4.003-4.003-4.003C4.793 1.993 3 3.786 3 5.997c0 1.866 1.283 3.421 3.012 3.865v9.131c0 .001 0 .001 0 .002 0 .003 0 .005 0 .008v.991h.057c.424 3.896 3.303 4.986 4.91 5 .001 0 .001 0 .002 0h.008c.007 0 .015.001.022.001.002 0 .003-.001.005-.001h.995v2c0 .4.24.77.62.92.37.16.8.07 1.09-.21l2.91-2.92c.2-.15.34-.37.38-.62v-.33c-.04-.25-.18-.48-.38-.63L13.721 20.283z"></path></svg>',
			collapsible: false,
			section: null,
			entities: entities
				.filter((entity) => recruitmentEntities.includes(entity.name))
				.sort((a, b) => recruitmentEntities.indexOf(a.name) - recruitmentEntities.indexOf(b.name))
				.map((entity) => ({ entityId: entity.id, allViewId: null }))
		},
	];

	const createdGroups = await Promise.all(
		groups.map(async (group) => {
			const allGroups = await getAllEntityGroups();
			let maxOrder = 0;
			if (allGroups.length > 0) {
				maxOrder = Math.max(...allGroups.map((f) => f.order ?? 0));
			}
			const existing = allGroups.find((f) => f.slug.trim() === group.slug.trim());
			if (existing) {
				console.warn("Group with this slug already exists", { slug: group.slug });
			}
			return await createEntityGroup({
				order: maxOrder + 1,
				slug: group.slug,
				title: group.title,
				icon: group.icon,
				collapsible: !!group.collapsible,
				section: group.section,
				entities: group.entities?.length ? group.entities : [],
			});
		})
	);

	console.log(`🌱 Created Recruitment CRM groups: ${createdGroups.length}`);
}

async function seedEntities(admin: any) {
	console.log(`🌱 Seed Recruitment CRM Template`);
	console.log(`🌱 Creating Recruitment CRM entities`);
	const entities = await importEntitiesFromTemplate({
		template: EntitiesJson as EntitiesTemplateDto,
		createdByUserId: admin.id,
	});
	console.log(`🌱 Created Recruitment CRM entities: ${entities.length}`);
	await seedGroups(entities);
}

async function seedRolePermissions(admin: any) {
	const templateSpecificRoles = [DefaultAppRoles.CompanyAdmin, DefaultAppRoles.CompanyMember, DefaultAppRoles.Supplier];

	await seedTemplateRoles({
		templateName: "Recruitment CRM",
		templatePermissions: RECRUITMENT_CRM_PERMISSIONS,
		templateSpecificRoles: templateSpecificRoles,
	});

	console.log(`🌱 Seed Recruitment CRM Template Successfull`);
}

const template = {
	seedEntities,
	seedGroups,
	seedRolePermissions,
};

export default template;
