import { Link } from "@remix-run/react";
import { Fragment } from "react";
import { TFunction } from "i18next";
import { RowDto } from "~/modules/rows/repositories/RowDto";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowHelper from "~/utils/helpers/RowHelper";

export default function RowRelationshipRow({
  entity,
  item,
  onRelatedRowClick,
  routes,
  t,
}: {
  entity: EntityWithDetails;
  item: RowDto;
  onRelatedRowClick?: () => void;
  routes?: EntitiesApi.Routes;
  t: TFunction;
}) {
  return (
    <Fragment>
      {onRelatedRowClick !== undefined ? (
        <button type="button" onClick={onRelatedRowClick} className="hover truncate text-left text-sm">
          {RowHelper.getTextDescription({ entity: entity, item, t })}
        </button>
      ) : (
        <div className="hover truncate text-left text-sm">
          {RowHelper.getTextDescription({ entity: entity, item, t })}
        </div>
      )}
    </Fragment>
  );
}
