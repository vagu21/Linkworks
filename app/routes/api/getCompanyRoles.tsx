import { json, LoaderFunction } from "@remix-run/node";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";

let companyRoles=["Company Member","Company Admin","Supplier"];
async function roles()
{
        const data=await getAllRoles("app"); 
        return data;
}

export let loader: LoaderFunction = async ({ request }) => {
    
    let data:any=await roles();

    data=data.filter((role:any)=>companyRoles.includes(role.name))

    return json(data);

}