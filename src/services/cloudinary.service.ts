const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryUploadResponse {
  url: string;
  secure_url: string;
  public_id: string;
}

export const uploadToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  try {
    const formData = new FormData();

    formData.append("file", file);
   // formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();

    return {
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};