import clsx from "clsx";
import { EntityTag } from "@prisma/client";
import { Link, useLocation } from "@remix-run/react";
import React, { useRef, useState } from "react";
import { RowTagWithDetails } from "~/utils/db/entities/rowTags.db.server";
import { useTranslation } from "react-i18next";
import { getBackgroundColor, getColors } from "~/utils/shared/ColorUtils";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import CloseIcon from "~/components/ui/icons/CloseIcon";
import InputSelector from "~/components/ui/input/InputSelector";
import ColorBadge from "~/components/ui/badges/ColorBadge";
interface Props {
  items: RowTagWithDetails[];
  onRemove?: (item: RowTagWithDetails) => void;
  onSetTagsRoute?: string;
}

export default function Tags({ items, onRemove, onSetTagsRoute }: Props) {
  const confirmDelete = useRef<RefConfirmModal>(null);
  const [selected, setSelected] = useState<string | number | undefined>(2);
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();
  const location = useLocation();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.set("action", "new-tag");
    formData.set("tag-color", selected);
    fetch(location.pathname + "/tags" + location.search, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error("Failed to delete tag. Server responded with an error.");
        }
      })
      .catch((error) => {
        alert(error.message || "An error occurred while processing your request.");
      });
  };
  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.tag.id && y.tag.id) {
        return x.tag.id > y.tag.id ? -1 : 1;
      }
      return -1;
    });
  };

  function onDeleteTag(tag: EntityTag) {
    confirmDelete.current?.setValue(tag);
    confirmDelete.current?.show(t("shared.tagDelete", { 0: tag.value }), t("shared.delete"), t("shared.cancel"));
  }
  function onConfirmDelete(tag: EntityTag) {
    const form = new FormData();
    form.set("action", "delete-tag");
    form.set("tag-id", tag.id);
    fetch(location.pathname + "/tags" + location.search, {
      method: "POST",
      body: form,
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error("Failed to delete tag. Server responded with an error.");
        }
      })
      .catch((error) => {
        alert(error.message || "An error occurred while processing your request.");
      });
  }

  const tags = sortedItems();

  return (
    <div className="flex flex-col py-[10px]">
      <label className="flex items-center gap-1 self-start whitespace-nowrap text-sm">
        <span className="my-auto self-stretch text-zinc-900">Tags</span>
        <span className="my-auto self-stretch text-rose-500">*</span>
      </label>

      <form method="post" onSubmit={handleSubmit} data-discover="true">
        <div className="mt-2 flex items-stretch gap-2">
          <input hidden readOnly name="action" value="new-tag" />
          <input
            type="text"
            id="tag-name"
            name="tag-name"
            value={inputValue}
            required
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Value"
            className="flex w-[60%] h-9 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-lg border border-solid border-zinc-300 bg-white px-3 text-sm leading-5 text-black flex-1 focus:border-0"
          />

          <InputSelector
            className={"!h-full"}
            name={""}
            title={""}
            withSearch={false}
            selectPlaceholder={t("models.group.color")}
            value={selected}
            setValue={setSelected}
            required={true}
            options={
              getColors(true).map((color) => {
                return {
                  name: (
                    <div className="flex items-center space-x-2 py-1 cursor-pointer">
                      <ColorBadge color={color} />
                    </div>
                  ),
                  value: color,
                };
              }) ?? []
            }
          ></InputSelector>

          <button
            type="submit"
            className="max-w-[40px] h-9 items-center justify-center rounded-lg border border-solid border-[#E4E7EC] bg-[#291400] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)]"
          >
            <div className="flex min-h-9 w-9 items-center justify-center gap-2 px-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9 15C5.6925 15 3 12.3075 3 9C3 5.6925 5.6925 3 9 3C12.3075 3 15 5.6925 15 9C15 12.3075 12.3075 15 9 15ZM12.4425 5.685L7.5 10.6275L5.5575 8.6925L4.5 9.75L7.5 12.75L13.5 6.75L12.4425 5.685Z"
                  fill="#FBFBFB"
                />
              </svg>
            </div>
          </button>
        </div>
      </form>

      <div className="mt-2 flex w-full flex-wrap items-start gap-1 overflow-y-auto text-sm text-zinc-900">
        {
          tags?.length ? (
            <>
              <ul className="leading-8">
                {tags.map((item) => {
                  return (
                    <li key={item.tag.value} className="inline select-none p-0.5">
                      <span className="relative inline-flex items-center rounded-md border border-gray-300 px-1 py-0.5">
                        <Link to={`${location.pathname}/${item.tag.id}/tags`} className="flex items-center">
                          <div className="absolute flex flex-shrink-0 items-center justify-center">
                            <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(item.tag.color))} aria-hidden="true" />
                          </div>
                          <div className="ml-3.5 pr-3 text-sm font-medium text-gray-900">{item.tag.value}</div>
                        </Link>
                        <button type="button" onClick={() => onDeleteTag(item.tag)} className="focus:outline-none">
                          <CloseIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} destructive />
            </>
          ) : <div className="flex w-full text-sm py-2">No Tags Added</div>
        }
      </div>
    </div>
  );
}
