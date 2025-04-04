import { Copy, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card } from "~/components/ui/card";
import { useTranslation } from "react-i18next";
import RowHelper from "~/utils/helpers/RowHelper";

interface UserCardProps {
  data: any;
  entity: any;
  item: any;
  onClick: any;
}

const UserCard: React.FC<UserCardProps> = ({ entity, item, data, onClick }) => {
  const [copied, setCopied] = useState("");
  const { t } = useTranslation();
  const [title, setTitle] = useState<string>("");
  const location = data?.currentLocation ?? "";

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 1500);
  };

  useEffect(() => {
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

    setTitle(titleValues || RowHelper.getRowFolio(entity, item));
  }, [entity, item, t]);

  return (
    <>
      <div className="flex w-[300px] items-center">
        <div className="mt-6">
          <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg" transform="scale(-1,1)">
            <path
              d="M14.0563 9.96449C14.6479 9.60076 14.6479 8.66487 14.0563 8.30114L1.78358 0.755466C1.25533 0.430684 0.500001 0.803022 0.500001 1.58714L0.5 16.6785C0.5 17.4626 1.25533 17.8349 1.78358 17.5102L14.0563 9.96449Z"
              fill="#E6E6E6"
              stroke="#E6E6E6"
            />
          </svg>
        </div>

        <Card className="z-50 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
              {title
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              {title && <h3 className="truncate text-lg font-semibold">{title}</h3>}
              {location && <p className="truncate text-sm text-gray-500">{location}</p>}
            </div>
            <ExternalLink
              className="h-5 w-5 cursor-pointer text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            />
          </div>
          <hr className="mt-3 border border-gray-200" />

          <div className="mt-4 space-y-2 p-2">
            {Object.entries(data).map(([key, value]) =>
              value ? (
                <div key={key} className="flex flex-col text-gray-700">
                  <span className="text-xs font-semibold uppercase text-gray-500">{key.replace(/_/g, " ")}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="max-w-[200px] truncate text-sm">{value?.toString()}</span>
                    <Copy className="h-4 w-4 cursor-pointer text-gray-400" onClick={(e) => copyToClipboard(e, value?.toString() ?? "")} />
                  </div>
                </div>
              ) : null
            )}
          </div>

          {copied && <div className="mt-2 text-center text-sm text-green-500">Copied: {copied}</div>}
        </Card>
      </div>
    </>
  );
};

export default UserCard;
