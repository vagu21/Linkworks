import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { createLogLogin } from "~/utils/db/logs.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUserByEmail, getUserByAzureID, setUserAzureAccount, UserWithoutPassword } from "~/utils/db/users.db.server";
import { validateRegistration } from "~/utils/services/authService";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { isCompanyEmail } from "company-email-validator";
import { companyFromEmail } from "~/utils/helpers/EmailHelper";
import UrlUtils from "~/utils/app/UrlUtils";
import axios from "axios";
import jwt from "jsonwebtoken";

type ActionData = { error?: string };
const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "";
  const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || "";
  const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "";
  const AZURE_REDIRECT_URL = process.env.AZURE_REDIRECT_URL || "";

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return badRequest({ error: "Authorization code missing in Azure AD OAuth flow." });
  }

  let userProfile;
  let idToken: any;
  let roles: string[] = [];
  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: AZURE_CLIENT_ID,
        client_secret: AZURE_CLIENT_SECRET,
        code: code,
        redirect_uri: AZURE_REDIRECT_URL,
        grant_type: "authorization_code",
        scope: "openid profile email User.Read",
        response_type: "code",
        prompt: "consent",
        access_type: "offline",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;
    idToken = tokenResponse.data.id_token;
    const role = jwt.decode(idToken) as jwt.JwtPayload; // Decode roles here
    roles = role?.roles?.length ? (role.roles as string[]) : [];

    // Step 2: Fetch user info from Microsoft Graph API
    const userResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    userProfile = userResponse.data; // Azure AD user profile
  } catch (e: any) {
    console.error("Azure AD OAuth error", e);
    return badRequest({ error: e.message });
  }

  // Step 3: Check if the user exists in DB
  let user = await getUserByAzureID(userProfile.id);
  if (user) {
    return signInAzureUser(request, user);
  } else {
    user = await getUserByEmail(userProfile.mail || userProfile.userPrincipalName);
    if (user) {
      // Link Azure account to existing user
      await setUserAzureAccount({ azureId: userProfile.id }, user.id);
      return signInAzureUser(request, user);
    }
  }

  // Step 4: Sign up new user
  return signUpAzureUser(request, userProfile, roles);
};

const signInAzureUser = async (request: Request, user: UserWithoutPassword) => {
  await createLogLogin(request, user);
  const userInfo = await getUserInfo(request);
  const userSession = await setLoggedUser(user);
  const tenant = await getTenant(userSession.defaultTenantId);

  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      lng: user.locale ?? userInfo.lng,
    },
    user.admin !== null ? "/admin/dashboard" : `/app/${tenant?.slug ?? tenant?.id}/dashboard`
  );
};

const signUpAzureUser = async (request: Request, userProfile: any, roles: any) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const [firstName, lastName] = userProfile.displayName?.split(" ") ?? ["", ""];

  let company = userProfile.companyName;
  if (!company) {
    if (isCompanyEmail(userProfile.mail || userProfile.userPrincipalName)) {
      company = companyFromEmail(userProfile.mail || userProfile.userPrincipalName);
    } else {
      company = UrlUtils.slugify(firstName + " " + lastName);
    }
  }
  const result = await validateRegistration({
    request,
    registrationData: {
      email: userProfile.mail || userProfile.userPrincipalName,
      firstName,
      lastName,
      company,
      avatarURL: userProfile.photo ? `https://graph.microsoft.com/v1.0/me/photo/$value` : undefined,
    },
    checkEmailVerification: false,
    stripeCustomerId: undefined,
    azureId: userProfile.id,
    addToTrialOrFreePlan: true,
    roles: roles,
    isAzureLogin: true,
  });
  if (result.registered) {
    const userSession = await setLoggedUser(result.registered.user);
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      `/app/${encodeURIComponent(result.registered.tenant.slug)}/dashboard`
    );
  }

  return badRequest({ error: t("shared.unknownError") });
};
