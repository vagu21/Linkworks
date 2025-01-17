import { json, LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";


export let loader: LoaderFunction = async ({ request,params }) => {
const companyId=params.companyId;
if (!companyId) {
    throw new Response("Company ID not provided", { status: 400 });
  }
   const users=await db.user.findMany({where:{companyId:companyId}});
   return json(users);
}