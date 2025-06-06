import { Entity } from "@prisma/client";
import { createS3File, deleteS3File } from "~/custom/utils/integrations/s3Service";
import { RowWithDetails, updateRowMedia } from "~/utils/db/entities/rows.db.server";
import { createSupabaseFile, deleteSupabaseFile } from "~/utils/integrations/supabaseService";

function getFileUploadService() {
  const providers = [
    {
      check: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
      service: { upload: createS3File, delete: deleteS3File, storageProvider: 's3' },
    },
    {
      check: process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY,
      service: { upload: createSupabaseFile, delete: deleteSupabaseFile, storageProvider: 'supabase' },
    },
  ];

  return providers.find(({ check }) => check)?.service || { upload: undefined, storageProvider: undefined };
}

export async function storeRowMediaInStorageProvider(entity: Entity, row: RowWithDetails | null) {
  if (!row) {
    return;
  }
  const mediaRowValues = row.values.filter((f) => f.media && f.media.length > 0);
  return await Promise.all(
    mediaRowValues.map(async (mediaRowValue) => {
      if (mediaRowValue.media) {
        return await Promise.all(
          mediaRowValue.media
            .filter((f) => !f.publicUrl)
            .map(async (media) => {
              const { storageProvider, upload } = getFileUploadService();
              console.log('Configured storage provider: ', storageProvider);
              if (storageProvider && typeof upload === 'function') {
                try {
                  media.name = sanitizeFileName(media.name);
                  const blob = await (await fetch(media.publicUrl ?? media.file)).blob();
                  const file = new File([blob], media.name);
                  const createdFile = await upload(entity.name, media.id + "-" + media.name, file);
                  if (createdFile.publicUrl) {
                    media.file = "";
                    media.publicUrl = createdFile.publicUrl;
                    media.storageBucket = entity.name;
                    media.storageProvider = storageProvider;
                    return await updateRowMedia(media.id, {
                      file: "",
                      publicUrl: createdFile.publicUrl,
                      storageBucket: entity.name,
                      storageProvider,
                    });
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.log("Could not create s3 file: " + e);
                }
              }
            })
        );
      }
    })
  );
}

export async function deleteRowMediaFromStorageProvider(row: RowWithDetails | null) {
  if (!row) {
    return;
  }
  const mediaRowValues = row.values.filter((f) => f.media && f.media.length > 0);
  return await Promise.all(
    mediaRowValues.map(async (mediaRowValue) => {
      if (mediaRowValue.media) {
        return await Promise.all(
          mediaRowValue.media.map(async (media) => {
            if (media.publicUrl && media.storageBucket) {
              if (media.storageProvider === "s3") {
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                  try {
                    await deleteS3File(media.storageBucket, media.id + "-" + media.name);
                    return await updateRowMedia(media.id, {
                      file: "",
                      publicUrl: "",
                      storageBucket: "",
                      storageProvider: "",
                    });
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log("Could not delete supabase file: " + e);
                  }
                }
              } else if (media.storageProvider === "supabase") {
                if (process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY) {
                  try {
                    await deleteSupabaseFile(media.storageBucket, media.id + "-" + media.name);
                    return await updateRowMedia(media.id, {
                      file: "",
                      publicUrl: "",
                      storageBucket: "",
                      storageProvider: "",
                    });
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log("Could not delete supabase file: " + e);
                  }
                }
              }
            }
          })
        );
      }
    })
  );
}

// export async function getMediaFromZipFiles(zipFiles: MediaDto[]) {
//   let createdFiles: MediaDto[] = [];
//   await Promise.all(
//     zipFiles.map(async (item) => {
//       const filePath = "zip-uploads/" + item.name.replace(" ", "");
//       deleteFile(filePath);
//       const path = await saveZip(filePath, { type: item.type, content: item.file.split(",")[1] });
//       if (path) {
//         const folderPath = path + "-unzip";
//         deleteFolder(folderPath, { recursive: true, force: true });
//         const entries = await extractZip(path);
//         entries.forEach((entry) => {
//           if (entry.name.startsWith("._")) {
//             return;
//           }
//           var file = entry.getData().toString("base64");
//           let type = "";
//           if (entry.name.toLowerCase().endsWith("xml")) {
//             type = "text/xml";
//           } else if (entry.name.toLowerCase().endsWith("pdf")) {
//             type = "application/pdf";
//           }
//           createdFiles.push({
//             title: entry.name,
//             name: entry.name,
//             file: `data:${type};base64,${file}`,
//             type,
//           });
//         });
//         deleteFile(path);
//       }
//       deleteFile(filePath);
//     })
//   );
//   return createdFiles;
// }

function sanitizeFileName(fileName: string): string {
  // Replace spaces with underscores
  const sanitized = fileName
    .replace(/\s+/g, "_")
    // Remove or replace other invalid characters as needed, e.g., commas, semicolons, etc.
    .replace(/[^a-zA-Z0-9._-]/g, "");
  // Optionally, you could add more specific replacements for known bad characters
  // .replace(/specific-bad-character/g, 'replacement')

  return sanitized;
}
