import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ServerError from "~/components/ui/errors/ServerError";
import UsDollarCircled from "~/components/ui/icons/crm/UsDollarCircled";
import { IconDto } from "~/components/ui/layouts/SidebarIconsLayout";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import CrmService from "~/modules/crm/services/CrmService";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";

type LoaderData = {
  title: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    title: `Actions | ${process.env.APP_NAME}`,
  };
  const tenantId = await getTenantIdOrNull({ request, params });
  await CrmService.validateActions(tenantId);
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const [items, setItems] = useState<IconDto[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const items: IconDto[] = [];
    let actionEntityFound = false;

    ["actions"].forEach((slug) => {
      const entity = appOrAdminData.entities.find((x) => x.slug === slug);
      if (entity) {
        items.push({
          name: t(entity.titlePlural),
          href: params.tenant ? `/app/${params.tenant}/${slug}` : `/admin/entities/action-builder/${slug}`,
          icon: getIcons(entity.slug)?.icon,
          iconSelected: getIcons(entity.slug)?.iconSelected,
        });
        actionEntityFound = true;
      }
    });

    if (!actionEntityFound) {
      setShowMessage(true); // Show the message when the "action" entity is not found
    }

    setItems(items);
  }, [appOrAdminData.entities, params.tenant, t]);

  function getIcons(entitySlug: string) {
    if (entitySlug === "actions") {
      return {
        icon: <UsDollarCircled className="h-5 w-5" />,
        iconSelected: <RefreshIcon className="h-5 w-5" />,
      };
    }
  }

  return (

    <Outlet />
  );
};

export function ErrorBoundary() {
  return <ServerError />;
}
