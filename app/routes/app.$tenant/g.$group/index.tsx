import { json, LoaderFunctionArgs, redirect, MetaFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { getAppDashboardStats } from "~/utils/services/appDashboardService";
import { DashboardStats } from "~/components/ui/stats/DashboardStats";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { Stat } from "~/application/dtos/stats/Stat";
import InputSelector from "~/components/ui/input/InputSelector";
import PeriodHelper, { defaultPeriodFilter, PeriodFilters } from "~/utils/helpers/PeriodHelper";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { useTypedLoaderData } from "remix-typedjson";
import { EntityGroupWithDetails, getEntityGroupBySlug } from "~/utils/db/entities/entityGroups.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { requireAuth } from "~/utils/loaders.middleware";
import { Suspense, useEffect, useState } from "react";
import SkeletonDashboard from "~/custom/modules/dashboard/components/Skeleton";
import DashboardCharts from "~/custom/modules/dashboard/components";
import { getDashBoardData } from "~/custom/modules/dashboard/services";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  group: EntityGroupWithDetails;
  stats: Stat[];
  dashboardStatsData: any
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAuth({ request, params });
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const group = await getEntityGroupBySlug(params.group!);
  const tenant = await getTenant(tenantId);
  if (!group) {
    throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
  }
  const stats = await getAppDashboardStats({
    t,
    tenant,
    gte: PeriodHelper.getGreaterThanOrEqualsFromRequest({ request }),
    entities: group.entities.flatMap((e) => e.entity),
  });
  stats
    .filter((f) => f.entity)
    .forEach((stat) => {
      stat.path = tenantId ? `/app/${tenantId}/g/${params.group}/${stat.entity?.slug}` : `/admin/g/${params.group}/${stat.entity?.slug}`;
    });
  const data: LoaderData = {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
    group,
    stats,
    dashboardStatsData: !params.entity && params.group === "recruitment" ? await getDashBoardData({ request, params }) : null, 
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function GroupIndexRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const {group,entity}=useParams();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setDashboardData(data);
  }, [group,entity,searchParams]);

  return (
    <EditPageLayout>
      {data.stats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between space-x-2">
            <h3 className="flex-grow font-medium leading-4 text-gray-900">{data.group.title}</h3>
            <div>
              <InputSelector
                className="w-44"
                withSearch={false}
                name="period"
                value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
                options={PeriodFilters.map((f) => {
                  return {
                    value: f.value,
                    name: t(f.name),
                  };
                })}
                setValue={(value) => {
                  if (value) {
                    searchParams.set("period", value?.toString() ?? "");
                  } else {
                    searchParams.delete("period");
                  }
                  setSearchParams(searchParams);
                }}
              />
            </div>
          </div>
          {group=='recruitment'?<></>:<DashboardStats items={data.stats} />}
          {entity == undefined && group == "recruitment" && dashboardData?.dashboardStatsData && (
            <div className="  mx-auto max-w-5xl space-y-3 px-4 pt-3 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
              <Suspense
                fallback={
                  <>
                    <SkeletonDashboard />
                  </>
                }
              >
                <DashboardCharts data={dashboardData} />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
