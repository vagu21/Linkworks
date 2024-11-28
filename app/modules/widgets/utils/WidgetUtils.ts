import { Widget } from "@prisma/client";
import { WidgetDto } from "../dtos/WidgetDto";

function toDto(widget: Widget): WidgetDto {
  const metadata: WidgetDto["metadata"] = JSON.parse(widget.metadata);
  const appearance: WidgetDto["appearance"] = JSON.parse(widget.appearance);
  return {
    ...widget,
    metadata,
    appearance,
  };
}

export default {
  toDto,
};
