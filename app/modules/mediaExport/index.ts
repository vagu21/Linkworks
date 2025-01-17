const apiKey: string | undefined = import.meta.env.VITE_CLIENT_API_KEY;
export async function downloadAction(id: any,type:String) {
    const response = await fetch("https://works.lfiapps.com/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": ``,
      },
      body: JSON.stringify({id,type}),
    });

  if (response.ok) {
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}.pdf`;
    link.click();
  } else {
    console.error("Error generating PDF");
  }
}