import { json } from "@remix-run/node";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { MemberInvitationCreatedDto } from "~/modules/events/dtos/MemberInvitationCreatedDto";
import EventsService from "~/modules/events/services/.server/EventsService";
import { getTenant } from "~/utils/db/tenants.db.server";
import { createUserInvitation } from "~/utils/db/tenantUserInvitations.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { sendEmail } from "~/utils/email.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getBaseURL } from "~/utils/url.server";

export async function sendInvitation(form:any,companyId:any,params:any,userId:any,request:any)
{
     if (params.entity == "accounts") {        
              const numberOfUsers = Number(form.get("numberOfUsers"));
              if (numberOfUsers == 0 || !numberOfUsers) {
                console.error("Please add atleast one company member.");
                return json({ error: "Please add atleast one company member." }, { status: 400 });
              }
              
              const tenantId = await getTenantIdFromUrl(params);
              const fromUser = await getUser(userId);
              const tenant = await getTenant(tenantId);
              if (!tenant || !fromUser) {
                return json({ error: "Could not find tenant or user" });
              }
    
              for (let i = 0; i < numberOfUsers; i++) {
                const email = form.get(`user[${i}]Email`)?.toString().toLowerCase().trim() || "";
                const firstName = form.get(`user[${i}]firstName`)?.toString().trim() || "";
                const lastName = form.get(`user[${i}]lastName`)?.toString().trim() || "";
                const sendInvitationEmail = form.get(`user[${i}]sendInvitationEmail`) === "true";
                const roles=form.get(`user[${i}]roles`).split(',')||[];
                const invitation = await createUserInvitation(tenantId, {
                  email,
                  companyId,
                  roles,
                  firstName,
                  lastName,
                  type: TenantUserType.MEMBER,
                  fromUserId: fromUser?.id ?? null,
                });
                if (!invitation) {
                  return json({
                    error: "Could not create invitation",
                  });
                }
                await EventsService.create({
                  request,
                  event: "member.invitation.created",
                  tenantId: tenant.id,
                  userId: fromUser.id,
                  data: {
                    user: { email: invitation.email, firstName: invitation.firstName, lastName: invitation.lastName, type: TenantUserType[invitation.type] },
                    tenant: { id: tenant.id, name: tenant.name },
                    fromUser: { id: fromUser!.id, email: fromUser!.email },
                  } satisfies MemberInvitationCreatedDto,
                });
                if (sendInvitationEmail) {
                  await sendEmail({
                    request,
                    to: email,
                    alias: "user-invitation",
                    data: {
                      name: firstName,
                      invite_sender_name: fromUser.firstName,
                      invite_sender_organization: tenant.name,
                      action_url: getBaseURL(request) + `/invitation/${invitation.id}`,
                    },
                  });
                }
              }
            }
}