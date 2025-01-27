import { json, LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { validateRequest } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  try {
    await validateRequest(request);
    const companyId = params.companyId;
    if (!companyId) {
      throw new Response("Company ID not provided", { status: 400 });
    }
    const users = await db.user.findMany({ where: { companyId: companyId } });
    return json(users);
  } catch (error: any) {
    return json({ error: error.message, status: 500 });
  }
};
