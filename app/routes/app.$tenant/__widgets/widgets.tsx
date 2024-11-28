import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import IconWidgets from "~/components/layouts/icons/IconWidgets";
import ServerError from "~/components/ui/errors/ServerError";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (params.tenant && !appConfiguration.widgets.enabled) {
    throw json({ error: "Widgets are disabled" }, { status: 400 });
  }
  return json({});
};

export default function () {
  const { t } = useTranslation();
  const params = useParams();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("widgets.plural"),
          href: UrlUtils.getModulePath(params, `widgets`),
          exact: true,
          icon: <IconWidgets className="h-5 w-5" />,
          iconSelected: <IconWidgets className="h-5 w-5" />,
        },
      ]}
    >
      <Outlet />
    </SidebarIconsLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
