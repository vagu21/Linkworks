import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { Graph_List } from "~/custom/modules/graphs/routes/api/graphRoutes.New.Api";
import { LoaderData } from "~/routes/app.$tenant/g.$group";
import DynamicGraphForm from "~/custom/modules/graphs/components/graphForm";

export const loader = (args: LoaderFunctionArgs) => Graph_List.loader(args);
export const action: ActionFunction = (args) => Graph_List.action(args);

const Graph = () => {
  const location = useLocation();
  const selectedChart = location.state?.selectedChart || {};
  const data: any = useLoaderData<LoaderData>();

  return (
    <div className="mt-6">
      <DynamicGraphForm entities={data?.entities} initialValues={selectedChart} groups={data?.groups} tenants={data?.tenants} />
    </div>
  );
};

export default Graph;
