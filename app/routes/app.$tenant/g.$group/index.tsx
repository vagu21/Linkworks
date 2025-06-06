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
import { getChartConfigs } from "~/custom/modules/graphs/utils";
import MasterGraphComponent from "~/custom/modules/graphs/components/masterGraphComponent";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  group: EntityGroupWithDetails;
  stats: Stat[];
  chartConfigs: any;
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
  const chartConfigs = await getChartConfigs(params.tenant, params.group, tenant?.id || null, request);
  stats
    .filter((f) => f.entity)
    .forEach((stat) => {
      stat.path = tenantId ? `/app/${tenantId}/g/${params.group}/${stat.entity?.slug}` : `/admin/g/${params.group}/${stat.entity?.slug}`;
    });
  const data: LoaderData = {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
    group,
    stats,
    chartConfigs: chartConfigs,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function GroupIndexRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const { group, entity } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();


  return (
    <EditPageLayout title={data.group.title}>
      {data.stats.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-end space-x-2">
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
          {data?.chartConfigs?.chartConfig && (<MasterGraphComponent chartConfig={data?.chartConfigs?.chartConfig} />)}
          <DashboardStats items={data.stats} />
        </div>
      )}
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
