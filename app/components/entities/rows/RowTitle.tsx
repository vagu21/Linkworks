import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import EntityOverViewCard from "~/custom/components/RowOverviewRoute/components/EntityOverView";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithValues } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";

export default function RowTitle({ entity, item }: { entity: EntityWithDetails; item: RowWithValues }) {
  const { t } = useTranslation();
  const [folio, setFolio] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [logo, setLogo] = useState<string>("");
  

  useEffect(() => {
    setFolio(RowHelper.getRowFolio(entity, item));
    let description = RowHelper.getTextDescription({ entity, item, t }) ?? "";
    if (description.length > 160) {
      description = description.substring(0, 160) + "...";
    }
    setDescription(description);

    const logoImageId = entity.properties.find((o) => o.name?.toLowerCase().includes("logo") || o.title?.toLowerCase().includes("logo"))?.id;
    const logoImage = item.values.find((o) => o.propertyId === logoImageId)?.media?.[0]?.file;
    const logoSrc = (entity.icon && !logoImage ? entity.icon : logoImage) || "";
    setLogo(logoSrc);

    const getTitleFieldIds = (searchTerms = ["name"]) => {
      return entity.properties
        .filter(({ name, title }) => {
          return [name, title]
            .filter((s) => typeof s === "string")
            .map((s) => s.toLowerCase().trim())
            .some((s) => searchTerms.some((term) => s.includes(term)));
        })
        .map((o) => o.id);
    };

    const nameIds = getTitleFieldIds();
    const titleValues = item.values
      .filter((v) => nameIds.includes(v.propertyId))
      .map((o) => o.textValue || "")
      .filter((s) => !!s)
      .join(" | ");

    setTitle(titleValues);
  }, [entity, item, t]);

  const subTitle =
    !description || folio === description ? (
      RowHelper.getRowFolio(entity, item)
    ) : (
      <>
        <span className="">{RowHelper.getRowFolio(entity, item)} | </span>
        {description}
      </>
    );

  return (
    <div className="flex flex-col w-full">
      <EntityOverViewCard
        logo={logo}
        title={title || RowHelper.getRowFolio(entity, item)}
        subTitle={<span className="my-2 text-xs font-medium uppercase">{subTitle}</span>}
      />
    </div>
  );
}
