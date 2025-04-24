import { useParams } from "@remix-run/react";
import { Phone, LucideMail } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FloatingLoader from "~/components/ui/loaders/FloatingLoader";
import DropdownMenu from "~/custom/components/tables/ThreeDotMenu";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";

interface ContactItemProps {
  icon: JSX.Element;
  content: string | JSX.Element;
}

const ContactItem = ({ icon, content }: ContactItemProps) => (
  <article className="flex shrink basis-0 items-center gap-2.5">
    {icon}
    <p className="my-auto overflow-hidden text-ellipsis whitespace-nowrap">{content}</p>
  </article>
);

interface EntityContactInfoState {
  phoneNumber?: string | JSX.Element;
  email?: string | JSX.Element;
}

interface EntityContactInfoProps {
  rowData: RowsApi.GetRowData;
  item: RowWithDetails;
}

const EntityContactInfo = ({ rowData, item }: EntityContactInfoProps) => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState<EntityContactInfoState>({
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    const getTitleFieldIds = (searchTerms: string[] = []) => {
      return rowData.entity.properties
        .filter(({ name, title }) => {
          return [name, title]
            .filter((s) => typeof s === "string")
            .map((s) => s.toLowerCase().trim())
            .some((s) => searchTerms.some((term) => s.includes(term)));
        })
        .map((o) => o.id);
    };

    const phoneNumberIds = getTitleFieldIds(["phone"]);
    const phoneNumberValues = item.values
      .filter((v) => phoneNumberIds.includes(v.propertyId))
      .map((o) => o.textValue || "")
      .filter((s) => !!s);

    const emailIds = getTitleFieldIds(["email"]);
    const emailValues = item.values
      .filter((v) => emailIds.includes(v.propertyId))
      .map((o) => o.textValue || "")
      .filter((s) => !!s);

    setContactInfo({
      email: emailValues?.length ? emailValues[0].trim() : "",
      phoneNumber: phoneNumberValues?.length ? phoneNumberValues[0].trim() : "",
    });
  }, [rowData?.entity, item, t]);

  return (
    <>
      <FloatingLoader loading={loading} />
      <section className="flex items-start justify-between gap-5 py-4 text-sm font-medium text-stone-800">
        <div className="flex items-start gap-5">
          {contactInfo.phoneNumber && <ContactItem icon={<Phone className="aspect-square w-5" />} content={contactInfo.phoneNumber} />}
          {contactInfo.email && <ContactItem icon={<LucideMail className="aspect-square w-5" />} content={contactInfo.email} />}
        </div>
        <div>
            <DropdownMenu
              item={item}
              setLoading={setLoading}
              entity={rowData?.entity}
              id={id}
              flag={true}
            />

        </div>
      </section>
    </>
  );
};

export default EntityContactInfo;
