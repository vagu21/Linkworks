import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { importEntitiesFromTemplate } from "~/utils/services/.server/entitiesTemplatesService";
import { CreatePermissionDto } from "~/utils/services/rolesAndPermissionsService";
import { createEntityPermissions, excludeRoles, onlyRoles, seedTemplateRoles } from "../../utils/helpers";
import EntitiesJson from './entities.json';
import { EntitiesTemplateDto } from "~/modules/templates/EntityTemplateDto";


const createJobEntityPermissions = (): CreatePermissionDto[] => {
	return createEntityPermissions('Job', [
		{ actions: ['view', 'read'], allRoles: true },
		{
			actions: ['create', 'update', 'delete'],
			rolesFilter: excludeRoles([DefaultAppRoles.Supplier, DefaultAppRoles.User])
		}
	]);
};

const createCompanyEntityPermissions = () => {
	const basePermissions = [
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map(r => r.toString()),
			name: 'app.settings.companyMembers.view',
			description: 'can view compnay memebers',
			type: 'app',
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map(r => r.toString()),
			name: 'app.settings.companyMembers.create',
			description: 'can add compnay memebers',
			type: 'app',
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map(r => r.toString()),
			name: 'app.settings.companyMembers.update',
			description: 'can remove compnay memebers',
			type: 'app',
		},
		{
			inRoles: [DefaultAppRoles.CompanyAdmin].map(r => r.toString()),
			name: 'app.settings.companyMembers.delete',
			description: 'can remove compnay memebers',
			type: 'app',
		},
	]
	return [
		...basePermissions,
		...createEntityPermissions('companies', [
			{
				actions: ['view', 'read'],
				allRoles: true,
			},
			{
				actions: ['create', 'update', 'delete'],
				rolesFilter: onlyRoles([DefaultAppRoles.Admin, DefaultAppRoles.SuperUser])
			}
		])
	]
};

const createCandidatesEntityPermissions = () => {
	return createEntityPermissions('Candidate', [
		{
			actions: ['view', 'read'],
			allRoles: true,
		},
		{
			actions: ['create', 'update', 'delete'],
			rolesFilter: excludeRoles([DefaultAppRoles.User])
		}
	]);
};

const createContactsEntityPermissions = () => {
	return createEntityPermissions('Contacts', [
		{
			actions: ['view', 'read'],
			allRoles: true,
		},
		{
			actions: ['create', 'update', 'delete'],
			rolesFilter: excludeRoles([DefaultAppRoles.User])
		}
	]);
};

const RECRUITMENT_CRM_PERMISSIONS = [
	...createJobEntityPermissions(),
	...createCompanyEntityPermissions(),
	...createCandidatesEntityPermissions(),
	...createContactsEntityPermissions(),
]

async function seedEntities(admin: any) {
	console.log(`🌱 Seed Recruitment CRM Template`);
	console.log(`🌱 Creating Recruitment CRM entities`)
	const entities = await importEntitiesFromTemplate({
    template: EntitiesJson as EntitiesTemplateDto,
    createdByUserId: admin.id,
  });
  console.log(`🌱 Created Recruitment CRM entities: ${entities.length}`)
}

async function seedRolePermissions(admin: any) {

  const templateSpecificRoles = [
    DefaultAppRoles.CompanyAdmin,
    DefaultAppRoles.CompanyMember,
    DefaultAppRoles.Supplier
  ]

	seedTemplateRoles({
		templateName: 'Recruitment CRM', 
		templatePermissions: RECRUITMENT_CRM_PERMISSIONS,
		templateSpecificRoles: templateSpecificRoles,
	});

	console.log(`🌱 Seed Recruitment CRM Template Successfull`);
}

const template = {
	seedEntities,
	seedRolePermissions,
}

export default template;