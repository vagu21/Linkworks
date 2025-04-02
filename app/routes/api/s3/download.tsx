import { json } from "@remix-run/node";
import { getS3FileDownload } from "~/custom/utils/integrations/s3Service";


export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!process.env.AWS_S3_BUCKET_NAME || !path) {
    return json({ error: "Missing bucket or path" }, { status: 400 });
  }

  try {
    console.log('fetching file from s3::', path);
    const fileBlob = await getS3FileDownload(path);
    if (!fileBlob) {
      return json({ error: "File not found" }, { status: 404 });
    }

    return new Response(fileBlob.stream(), {
      headers: {
        "Content-Type": fileBlob.type || "application/octet-stream",
        "Content-Length": fileBlob.size.toString(),
        "Content-Disposition": `attachment; filename="${path.split("/").pop()}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    return json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
