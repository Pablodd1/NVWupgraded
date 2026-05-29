/**
 * Upload files via the secure server-side /api/upload endpoint.
 * The API key is stored server-side in IMGBB_API_KEY env var — never exposed to the client.
 */
export async function fileUpload(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Upload failed:", err);
        return null;
      }

      const data = await response.json();
      return data.url as string;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  });

  const uploadedUrls = await Promise.all(uploadPromises);
  return uploadedUrls.filter((url): url is string => !!url);
}
