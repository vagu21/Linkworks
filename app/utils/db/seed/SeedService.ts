/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TenantUserJoined } from "~/application/enums/tenants/TenantUserJoined";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { TenantUserStatus } from "~/application/enums/tenants/TenantUserStatus";
import { getAvailableTenantInboundAddress } from "~/utils/services/emailService";
import { seedRolesAndPermissions } from "~/utils/services/rolesAndPermissionsService";
import RecruitmentCRMTemplate from "./templates/recruitment-crm";

const db = new PrismaClient();

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL);

async function seed() {
  if (!ADMIN_EMAIL || !process.env.ADMIN_SECRET) {
    throw new Error("❌ Seeding admin user failed, please check admin account's email or password is configured in the .env file");
  }

  console.log("🌱 Seeding admin user", 1);
  const admin = await createUser("Pavaneswar", "Nidamanuri", ADMIN_EMAIL, String(process.env.ADMIN_SECRET), TenantUserType.OWNER);

  console.log("🌱 Creating users with tenants", 2);
  const user1 = await createUser("Shubham", "Vyas", "svyas@linkfields.com", "password");
  const user2 = await createUser("Ayush", "Goyal", "agoyal@linkfields.com", "password");

  const tenants = [
    {
      id: "lfi-india",
      name: "LFI India",
      users: [
        { ...admin, type: TenantUserType.ADMIN },
        { ...user1, type: TenantUserType.ADMIN },
        { ...user2, type: TenantUserType.MEMBER },
      ],
    },
    {
      id: "lfi-south-africa",
      name: "LFI SA",
      users: [
        { ...user1, type: TenantUserType.OWNER },
        { ...user2, type: TenantUserType.MEMBER },
      ],
    },
    {
      id: "lfi-usa",
      name: "LFI USA",
      users: [
        { ...user1, type: TenantUserType.OWNER },
        { ...user2, type: TenantUserType.MEMBER },
      ],
    },
    {
      id: "lfi-uae",
      name: "LFI UAE",
      users: [
        { ...user1, type: TenantUserType.OWNER },
        { ...user2, type: TenantUserType.MEMBER },
      ],
    },
    {
      id: "lfi-au",
      name: "LFI AU",
      users: [
        { ...user1, type: TenantUserType.OWNER },
        { ...user2, type: TenantUserType.MEMBER },
      ],
    },
  ];

  console.log("🌱 Creating tenants", tenants.length);
  await Promise.all(tenants.map((tenant) => createTenant(tenant.id, tenant.name, tenant.users)));

  await RecruitmentCRMTemplate.seedEntities(admin);

  // Permissions
  await seedRolesAndPermissions(ADMIN_EMAIL);

  await RecruitmentCRMTemplate.seedRolePermissions(admin);
}

async function createUser(firstName: string, lastName: string, email: string, password: string, adminRole?: TenantUserType) {
  const passwordHash = await bcrypt.hash(password, 10);
  let user = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    console.log(`ℹ️ User already exists`, email);
    return user;
  }
  user = await db.user.create({
    data: {
      email,
      passwordHash,
      avatar: "",
      firstName,
      lastName,
      phone: "",
    },
  });
  if (adminRole !== undefined) {
    await db.adminUser.create({
      data: {
        userId: user.id,
      },
    });
  }
  return user;
}

async function createTenant(slug: string, name: string, users: { id: string; type: TenantUserType }[]) {
  let tenant = await db.tenant.findUnique({
    where: { slug },
  });
  if (tenant) {
    console.log(`ℹ️ Tenant already exists`, slug);
    return tenant;
  }
  const address = await getAvailableTenantInboundAddress(name);
  tenant = await db.tenant.create({
    data: {
      name,
      slug,
      icon: "",
      inboundAddresses: {
        create: {
          address,
        },
      },
    },
  });

  let tenantId = tenant.id;

  await db.tenantSubscription.create({
    data: {
      tenantId,
      stripeCustomerId: "",
    },
  });

  for (const user of users) {
    const tenantUser = await db.tenantUser.findFirst({
      where: { tenantId, userId: user.id },
    });
    if (tenantUser) {
      console.log(`ℹ️ User already in tenant`, user.id, tenantId);
      continue;
    }
    await db.tenantUser.create({
      data: {
        tenantId,
        userId: user.id,
        type: user.type,
        joined: TenantUserJoined.CREATOR,
        status: TenantUserStatus.ACTIVE,
      },
    });
  }

  return tenant;
}

export default {
  seed,
};
