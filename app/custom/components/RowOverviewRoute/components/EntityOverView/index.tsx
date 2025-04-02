import EntityContactInfo from "../EntityInfo";

interface EntityLogoProps {
  src: string;
}

const EntityLogo: React.FC<EntityLogoProps> = ({ src }) =>
  typeof src === 'string' && src.startsWith('<svg') ? (
    <div
      className="my-auto flex aspect-square h-[60px] w-[60px] shrink-0 items-center justify-center self-stretch rounded-[100px] bg-[#FF7800] text-white p-5"
      dangerouslySetInnerHTML={{ __html: src }}
    />
  ) : (
    <img loading="lazy" src={src} className="my-auto aspect-square w-[60px] shrink-0 self-stretch rounded-[100px] object-contain text-sm text-gray-400 text-ellipsis" alt="Entity logo" />
  );

interface EntityNameProps {
  name: string | JSX.Element; // Hiredigital Technologies
  verificationIconSrc: string;
}

const EntityName: React.FC<EntityNameProps> = ({ name, verificationIconSrc = "" }) => (
  <div className="flex w-full flex-wrap items-center gap-2.5 text-lg font-semibold text-stone-800 max-md:max-w-full">
    <h2 className="my-auto self-stretch">{name}</h2>
    {/* <img
      loading="lazy"
      src={
        "https://cdn.builder.io/api/v1/image/assets/TEMP/dc3c8db61faffc0c273470d1b335fa92905ad0d8c2619985c3182637dbeccf9d?placeholderIfAbsent=true&apiKey=86147b36fc4a4bfb9addc8a5a8ea4511"
      }
      className="my-auto aspect-square w-6 shrink-0 self-stretch object-contain"
      alt="Verification icon"
    /> */}
  </div>
);

interface EntityDetailsProps {
  subTitle: string | JSX.Element; // HIRE-0001 | Hyderabad | 1-50 Employees
}

const EntityDetails: React.FC<EntityDetailsProps> = ({ subTitle }) => <p className="text-xs truncate text-neutral-700 max-md:max-w-full">{subTitle}</p>;

interface EntityOverviewCard {
  logo: string;
  title: string | JSX.Element;
  subTitle: string | JSX.Element;
}

const EntityOverViewCard: React.FC<EntityOverviewCard> = ({
  logo = "https://cdn.builder.io/api/v1/image/assets/TEMP/344ba1644083176c8cbffe63b6f75131fec536f8f7b395703a68b5bcb7715843?placeholderIfAbsent=true&apiKey=86147b36fc4a4bfb9addc8a5a8ea4511",
  title = "",
  subTitle = "",
}) => {
  return (
    <>
      <article className="flex flex-wrap items-center gap-2.5 py-2.5">
        <EntityLogo src={logo} />
        <div className="my-auto min-w-60 flex-1 shrink basis-0 self-stretch max-md:max-w-full">
          <EntityName name={title} verificationIconSrc="" />
          <EntityDetails subTitle={subTitle} />
        </div>
      </article>
    </>
  );
};

export default EntityOverViewCard;
