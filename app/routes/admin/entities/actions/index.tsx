import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import RowsList from "~/components/entities/rows/RowsList";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import CrmService, { CrmSummaryDto } from "~/modules/crm/services/CrmService";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import { requireAuth } from "~/utils/loaders.middleware";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  title: string;
  summary: CrmSummaryDto;
  routes: EntitiesApi.Routes;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAuth({ request, params });
  const tenantId = await getTenantIdOrNull({ request, params });
  const data: LoaderData = {
    title: `Actions | ${process.env.APP_NAME}`,
    summary: await CrmService.getSummary(tenantId),
    routes: EntitiesApi.getNoCodeRoutes({ request, params }),
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-foreground text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-4">
        <Link
          to={params.tenant ? `/app/${params.tenant}/entites/actions/actions` : "/admin/entities/actions/actions"}
          className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow hover:bg-gray-50"
        >
          <dt className="truncate text-xs font-medium uppercase text-gray-500">Actions</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.companies)}</dd>
        </Link>
      </dl>
    </div>
  );
}
