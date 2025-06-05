import { EntityTag } from "@prisma/client";
import { useLocation, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import CheckEmptyCircle from "~/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "~/components/ui/icons/CheckFilledCircleIcon";
import TrashEmptyIcon from "~/components/ui/icons/TrashEmptyIcon";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { getColors } from "~/utils/shared/ColorUtils";

export default function EditTag({ item, tags }: { item: RowWithDetails; tags: EntityTag[] }) {
  const { t } = useTranslation();
  const { tagid } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();
  const isAdding = navigation.state === "submitting" && navigation.formData?.get("action") === "new-tag";
  const confirmDelete = useRef<RefConfirmModal>(null);
  // const [tagName, setTagName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
      // setTagName("");
    }
  }, [isAdding]);

  function onChangeTag(tag: EntityTag, value: string, color: Colors) {
    if (tag.value === value && tag.color === color) {
      return;
    }
    const form = new FormData();
    form.set("action", "edit-tag");
    form.set("tag-id", tag.id);
    form.set("tag-name", value);
    form.set("tag-color", color.toString());
    submit(form, {
      method: "post",
      action: location.pathname + location.search,
    });
  }

  function onSetRowTag(id: string, add: any) {
    const form = new FormData();
    form.set("action", "edit-tag");
    form.set("tag-id", id);
    // form.set("tag-action", add === true ? "add" : "remove");
    submit(form, {
      method: "post",
      action: location.pathname + location.search,
    });
  }
  function onDeleteTag(tag: EntityTag) {
    confirmDelete.current?.setValue(tag);
    confirmDelete.current?.show(t("shared.tagDelete", { 0: tag.value }), t("shared.delete"), t("shared.cancel"));
  }
  function onConfirmDelete(tag: EntityTag) {
    const form = new FormData();
    form.set("action", "delete-tag");
    form.set("tag-id", tag.id);
    submit(form, {
      method: "post",
      action: location.pathname + location.search,
    });
  }

  const tagData: any = tags.filter((tag) => tag.id == tagid);
  let tag = tagData[0];
  return (
    <div className="space-y-2">
      {tags.length === 0 && (
        <div>
          <EmptyState
            captions={{
              thereAreNo: t("shared.noTags"),
            }}
          />
        </div>
      )}

      <div key={tag.id} className="flex space-x-2">
        <InputText
          className="w-full"
          name={"tag-name-" + tag.id}
          title=""
          withLabel={false}
          value={tag.value}
          setValue={(value) => onChangeTag(tag, value?.toString(), tag.color)}
        />
        <InputSelector
          className="w-36"
          name="color"
          title={t("models.group.color")}
          withSearch={false}
          withLabel={false}
          value={tag.color}
          setValue={(e) => onChangeTag(tag, tag.value, Number(e))}
          options={
            getColors().map((color) => {
              return {
                name: (
                  <div className="flex items-center space-x-2">
                    <ColorBadge color={color} />
                  </div>
                ),
                value: color,
              };
            }) ?? []
          }
        ></InputSelector>
        <button type="button" onClick={() => onSetRowTag(tag.id, item.tags.filter((f) => f.tagId === tag.id).length === 0)} className="focus:outline-none">
          {item.tags.filter((f) => f.tagId === tag.id).length > 0 ? (
            <CheckFilledCircleIcon className="h-4 w-4 text-teal-500 hover:text-teal-600" />
          ) : (
            <CheckEmptyCircle className="h-4 w-4 text-gray-500 hover:text-gray-600" />
          )}
        </button>
        <button type="button" onClick={() => onDeleteTag(tag)} className="focus:outline-none">
          <TrashEmptyIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
        </button>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} destructive />
    </div>
  );
}
