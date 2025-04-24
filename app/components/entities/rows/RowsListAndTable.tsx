import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import { RowHeaderActionDto } from "~/application/dtos/data/RowHeaderActionDto";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import EntityHelper from "~/utils/helpers/EntityHelper";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import  {  getConditionalActions } from "~/modules/customActionComponent";
import FloatingLoader from "~/components/ui/loaders/FloatingLoader";
import DataTable from "~/custom/components/tables/DataTable";
import DropdownCandidateMenu from "~/custom/components/tables/ThreeDotMenu";
import { useParams } from "@remix-run/react";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  columns?: ColumnDto[];
  pagination?: PaginationDto;
  className?: string;
  editable?: boolean;
  selectedRows?: RowWithDetails[];
  onSelected?: (item: RowWithDetails[]) => void;
  onFolioClick?: (item: RowWithDetails) => void;
  onEditClick?: (item: RowWithDetails) => void;
  onRelatedRowClick?: (item: RowWithDetails) => void;
  leftHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  rightHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  allEntities: EntityWithDetails[];
  onRemove?: (item: RowWithDetails) => void;
  searchInput?: string;
  entityTitle?: string;
  onNewRow?: () => void;
  permissionCreate?: boolean;
}

export default function RowsListAndTable({
  entity,
  routes,
  items,
  pagination,
  className = "",
  columns,
  editable = true,
  selectedRows,
  onSelected,
  onFolioClick,
  onEditClick,
  onRelatedRowClick,
  leftHeaders,
  rightHeaders,
  allEntities,
  onRemove,
  searchInput,
  entityTitle,
  onNewRow,
  permissionCreate,
}: Props) {
  const { t } = useTranslation();
  const { id } = useParams(); 

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);
  const [actions, setActions] = useState<RowHeaderActionDto<RowWithDetails>[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    let headers = RowDisplayHeaderHelper.getDisplayedHeaders({
      routes,
      entity,
      columns,
      layout: "table",
      allEntities,
      onFolioClick,
      onEditClick,
      onRelatedRowClick,
      t,
    });

    if (actions.length > 0) {
      headers.push({
        name: "actions",
        title: "Action",
        value: (item) => (
          <div>
            {actions.map((action, index) => {
                return <DropdownCandidateMenu key={index} item={item} setLoading={setLoading} entity={entity} id={id} />;
              
              
            })}
          </div>
        ),
      });
    }
  
    if (leftHeaders) {
      headers = [...leftHeaders, ...headers];
    }
    if (rightHeaders) {
      setHeaders([...headers, ...rightHeaders]);
    } else {
      setHeaders(headers);
    }
  }, [actions, entity, columns, leftHeaders, rightHeaders, routes, allEntities, onFolioClick, onEditClick, onRelatedRowClick, t, onRemove, setLoading]);


  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);
      const fetchedActions = await getConditionalActions(entity, onRemove, setLoading);
      setActions(fetchedActions);
      setLoading(false);
    };

    fetchActions();
  }, [entity, onRemove]);
  
  useEffect(() => {
    const actions: RowHeaderActionDto<RowWithDetails>[] = [];
    if (onRemove) {
      actions.push({
        title: (
          <div>
            <TrashIcon className="h-4 w-4 text-gray-300 hover:text-gray-600" />
          </div>
        ),
        onClick: (_, item) => onRemove(item),
        firstColumn: true,
      });
    }

    setActions(actions);
  }, [editable, entity, onEditClick, onRemove, routes, t]);

  function getHref(item: RowWithDetails) {
    return EntityHelper.getRoutes({ routes, entity, item })?.overview;
  }
  return (
    <div className={className}>
      <FloatingLoader loading={loading} />
      <DataTable
        headers={headers}
        items={items}
        entity={entity}
        pagination={pagination}
        selectedRows={selectedRows}
        onSelected={onSelected}
        actions={actions}
        onClickRoute={(_, item) => getHref(item)}
        searchInput={searchInput}
        entityTitle={entityTitle}
        onNewRow={onNewRow}
        permissionCreate={permissionCreate}
      />
    </div>
  );
}
