import React, { useEffect, useRef } from "react";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { downloadAction } from "~/modules/mediaExport";

interface MenuItemProps {
  icon?: string | React.ReactNode;
  text: string;
  highlighted?: boolean;
  className?: string;
  textColor?: string;
  item: any;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: any;
}

const onDownload = (media: MediaDto) => {
  const downloadLink = document.createElement("a");
  downloadLink.href = media.publicUrl ?? media.file;
  downloadLink.download = media.name;
  downloadLink.click();
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, item, text, highlighted = false, className = "", textColor, setIsOpen, setLoading }) => {
  const bgColor = highlighted ? "" : "bg-white";
  const textStyle = textColor ? { color: textColor } : {};

  return (
    <button
      className={`flex w-full items-center gap-2.5 px-3 font-medium hover:bg-[#FFEFC9] ${bgColor} min-h-9 rounded-lg text-left ${className}`}
      style={textStyle}
      onClick={async (e: any) => {
        e.stopPropagation();
        try {
          if (text === "Download Summary") {
            setLoading(true);
            await downloadAction(item.id, "resume");
            setLoading(false);
          } else {
            setLoading(true);
            onDownload(item.media[0]);
            setLoading(false);
          }
          setIsOpen(false);
        } catch (error) {
          return error;
        }
      }}
    >
      <div className="flex w-full gap-2.5 items-center">
        {icon && <div className="h-4 w-4">{typeof icon === "string" ? <img src={icon} alt="icon" /> : icon}</div>}
        <div className="w-[96%] overflow-hidden truncate text-ellipsis whitespace-nowrap">{text}</div>
      </div>
    </button>
  );
};

interface DropdownMenuProps {
  item: any;
  setLoading: any;
  entity: any;
  id: any;
}

const DropdownCandidateMenu: React.FC<DropdownMenuProps> = ({ item, setLoading, entity, id }) => {
  const mediaValues = item.values.filter((val: any) => val?.media && val.media.length > 0);
  // const propertyIds = mediaValues.map((item: any) => item.propertyId);
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = useRef(null);
  const toggleDropdown = (e: any) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={ref} className="relative">
        <div className="relative">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 cursor-pointer rounded-md border-2 border-gray-300 ${isOpen ? "bg-[#f6f4f4]" : "bg-white"}`}
            onClick={toggleDropdown}
          >
            <path
              d="M12.0026 16.8021C11.6818 16.8021 11.4071 16.6878 11.1786 16.4594C10.9502 16.2309 10.8359 15.9563 10.8359 15.6354C10.8359 15.3146 10.9502 15.0399 11.1786 14.8115C11.4071 14.583 11.6818 14.4688 12.0026 14.4688C12.3234 14.4688 12.5981 14.583 12.8266 14.8115C13.055 15.0399 13.1693 15.3146 13.1693 15.6354C13.1693 15.9563 13.055 16.2309 12.8266 16.4594C12.5981 16.6878 12.3234 16.8021 12.0026 16.8021ZM12.0026 13.3021C11.6818 13.3021 11.4071 13.1878 11.1786 12.9594C10.9502 12.7309 10.8359 12.4563 10.8359 12.1354C10.8359 11.8146 10.9502 11.5399 11.1786 11.3115C11.4071 11.083 11.6818 10.9688 12.0026 10.9688C12.3234 10.9688 12.5981 11.083 12.8266 11.3115C13.055 11.5399 13.1693 11.8146 13.1693 12.1354C13.1693 12.4563 13.055 12.7309 12.8266 12.9594C12.5981 13.1878 12.3234 13.3021 12.0026 13.3021ZM12.0026 9.80208C11.6818 9.80208 11.4071 9.68785 11.1786 9.45938C10.9502 9.2309 10.8359 8.95625 10.8359 8.63542C10.8359 8.31458 10.9502 8.03993 11.1786 7.81146C11.4071 7.58299 11.6818 7.46875 12.0026 7.46875C12.3234 7.46875 12.5981 7.58299 12.8266 7.81146C13.055 8.03993 13.1693 8.31458 13.1693 8.63542C13.1693 8.95625 13.055 9.2309 12.8266 9.45938C12.5981 9.68785 12.3234 9.80208 12.0026 9.80208Z"
              fill="#121212"
            />
          </svg>
        </div>

        <div className="absolute -left-[220px] top-[-32px] min-w-[200px]">
          {isOpen && (
            <>
              <div className="flex items-center">
                <div className="w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                  <div className="p-1">
                    <MenuItem icon="/get_app.png" text="Download Resume" highlighted={true} item={mediaValues[0]} setIsOpen={setIsOpen} setLoading={setLoading} />
                    <MenuItem icon="/get_app.png" text="Download Summary" className="my-1" item={item} setIsOpen={setIsOpen} setLoading={setLoading} />
                  </div>
                </div>
                <div>
                  <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14.0563 9.96449C14.6479 9.60076 14.6479 8.66487 14.0563 8.30114L1.78358 0.755466C1.25533 0.430684 0.500001 0.803022 0.500001 1.58714L0.5 16.6785C0.5 17.4626 1.25533 17.8349 1.78358 17.5102L14.0563 9.96449Z"
                      fill="white"
                      stroke="#E6E6E6"
                    />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DropdownCandidateMenu;

