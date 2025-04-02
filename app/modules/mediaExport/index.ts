export async function downloadAction(id: any,type:String) {

  const serverUrl = import.meta.env.VITE_PUBLIC_SERVER_URL;
    const response = await fetch(`${serverUrl}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": ``,
        // "Authorizariton":`Bearer ${token}`
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