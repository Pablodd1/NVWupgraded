import axios from "axios";

export async function fileUpload(files: File[]) {
  const apiKey = "812b8a2ed8cf66bebd06276bf07e119f";

  const uploadPromises = files.map((file) => {
    const formData = new FormData();
    formData.append("image", file);

    return axios
      .post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData)
      .then((response) => response.data.data.url)
      .catch((error) => {
        console.error("Error uploading the image", error);
        return null;
      });
  });

  const uploadedUrls = await Promise.all(uploadPromises);

  return uploadedUrls.filter((url) => url !== null);
}
