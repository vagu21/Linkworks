import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { WidgetDto, WidgetDataDto } from "~/modules/widgets/dtos/WidgetDto";
import WidgetUtils from "~/modules/widgets/utils/WidgetUtils";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.id, "Widget ID is required");
  const widgetId = params.id!;
  const widget = await db.widget.findUnique({
    where: {
      id: widgetId,
    },
  });
  if (!widget) {
    return json("Not found", { status: 404 });
  }

  const widgetDto = WidgetUtils.toDto(widget);
  console.log("/api/widget/" + widgetId, { widgetDto });

  return json(widgetDto);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.id, "Widget ID is required");
  const widgetId = params.id!;
  const form = await request.formData();
  const action = form.get("action");
  if (action === "test-widget") {
    const content = form.get("content");
    let data: WidgetDataDto = {};
    if (content === "test-error") {
      data = {
        error: "Testing error",
      };
    } else {
      data = {
        success: "Content received: " + content,
      };
    }
    console.log("/api/widget/" + widgetId, { data });
    return json(data);
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};
