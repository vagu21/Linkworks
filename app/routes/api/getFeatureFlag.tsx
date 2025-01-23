import { json, LoaderFunction } from "@remix-run/node";
import { getFeatureFlag } from "~/modules/featureFlags/db/featureFlags.db.server";
import { validateRequest } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  try {
    await validateRequest(request);
    const name = new URL(request.url).searchParams.get("name");
    let data: any = await getFeatureFlag({ name: `${name}` });

    return json(data);
  } catch (error: any) {
    return json({ error: error.message, status: 500 });
  }
};
