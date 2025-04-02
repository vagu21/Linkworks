import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import { useTranslation } from "react-i18next";

interface Props {
  name?: string;
  title?: string;
  accept?: string;
  multiple?: boolean;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  uploadText?: string;
  autoFocus?: boolean;
  onDropped?: (base64: string, file: File) => void;
  onDroppedFiles?: (fileBase64: FileBase64[], files: any[]) => void;
}

export default function UploadDocuments({
  name = "uploadmyfile",
  className,
  title = "",
  accept,
  multiple,
  description,
  icon = "",
  disabled,
  onDropped,
  onDroppedFiles,
  uploadText,
  autoFocus,
}: Props) {
  const { t } = useTranslation();

  const [isDragging, setIsDragging] = useState(false);
  const [loading] = useState(false);
  const [customClasses, setCustomClasses] = useState("");

  function dragOver(e: any) {
    e.preventDefault();
    if (!loading) {
      setIsDragging(true);
    }
  }
  function dragLeave() {
    setIsDragging(false);
  }
  // async function compressFile(imageFile: File): Promise<File> {
  //   const options = {
  //     maxSizeMB: 0.5,
  //     maxWidthOrHeight: 1920 / 2,
  //     useWebWorker: true,
  //   };
  //   try {
  //     return await imageCompression(imageFile, options);
  //   } catch (error) {
  //     return await Promise.reject(error);
  //   }
  // }
  // async function compressFileNotImage(imageFile: File): Promise<File> {
  //   return Promise.resolve(imageFile);
  // }
  async function drop(e: any) {
    try {
      e.preventDefault();
    } catch {
      // ignore
    }
    const files: File[] = await Promise.all(
      [...e.dataTransfer.files].map(async (element: File) => {
        return element;
        // if (element.type.includes("image")) {
        //   return await compressFile(element);
        // } else {
        //   return await compressFileNotImage(element);
        // }
      })
    );
    const filesArray: FileBase64[] = [];

    await Promise.all(
      files.map(async (file) => {
        const base64 = await getBase64(file);
        filesArray.push({
          base64,
          file,
        });
        if (onDropped) {
          onDropped(base64, file);
        }
      })
    );
    if (onDroppedFiles) {
      onDroppedFiles(filesArray, files);
    }
    setIsDragging(false);
  }
  function requestUploadFile() {
    const src = document.querySelector("#" + name);
    drop({ dataTransfer: src });
  }
  function getBase64(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev?.target?.result?.toString() ?? "");
      };
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    setCustomClasses(isDragging && !loading && !disabled ? "border-2 border-border border-dashed" : "");
  }, [isDragging, loading, disabled]);

  return (
    <div
      className={clsx(
        "flex flex-col justify-center drop  items-center p-4 text-sm bg-inside rounded-lg border-2  text-center border-dashed !bg-[#FAFAFA] !border-[#E6E6E6]",
 
        customClasses,
        className
      )}
      onDragOver={dragOver}
      onDragLeave={dragLeave}
      onDrop={drop}
    >
      {(() => {
        if (loading) {
          return <div className="mx-auto text-base font-medium">{t("shared.loading")}...</div>;
        } else {
          return (
            <div>
              <div className="text-primary mx-auto text-sm font-bold">{title}</div>
              <div className="manual">
                <div className="space-y-1 text-center">
                  <label htmlFor={name} className="cursor-pointer">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Icon */}
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_205_16188)">
                          <path
                            d="M16.625 8.36671C16.0583 5.49171 13.5333 3.33337 10.5 3.33337C8.09167 3.33337 6 4.70004 4.95833 6.70004C2.45 6.96671 0.5 9.09171 0.5 11.6667C0.5 14.425 2.74167 16.6667 5.5 16.6667H16.3333C18.6333 16.6667 20.5 14.8 20.5 12.5C20.5 10.3 18.7917 8.51671 16.625 8.36671ZM16.3333 15H5.5C3.65833 15 2.16667 13.5084 2.16667 11.6667C2.16667 9.95837 3.44167 8.53337 5.13333 8.35837L6.025 8.26671L6.44167 7.47504C7.23333 5.95004 8.78333 5.00004 10.5 5.00004C12.6833 5.00004 14.5667 6.55004 14.9917 8.69171L15.2417 9.94171L16.5167 10.0334C17.8167 10.1167 18.8333 11.2084 18.8333 12.5C18.8333 13.875 17.7083 15 16.3333 15ZM7.16667 10.8334H9.29167V13.3334H11.7083V10.8334H13.8333L10.5 7.50004L7.16667 10.8334Z"
                            fill="#FF7800"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_205_16188">
                            <rect width="20" height="20" fill="white" transform="translate(0.5)" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </label>


                  <div className="flex items-center space-x-1">
                    <label htmlFor={name}>
                      <p
                        className={clsx(
                          "text-sm font-bold underline",
                          !disabled ? "cursor-pointer" : "cursor-not-allowed"
                        )}
                      >
                        <span>{t("app.shared.buttons.uploadDocument")}</span>                      </p>
                    </label>
                    <p className="text-xs text-black">
                    <span className="lowercase">
                        {t("shared.or")} {t("shared.dragAndDrop")}
                      </span>
                    </p>
                  </div>

                  <input
                    className="uploadmyfile"
                    disabled={disabled}
                    type="file"
                    id={name}
                    accept={accept}
                    multiple={multiple}
                    onChange={requestUploadFile}
                    autoFocus={autoFocus}
                    hidden
                  />
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}