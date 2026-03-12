import { ChangeEvent } from "react";

type MultipleImageUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload?: (file: File) => Promise<string>;
};

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({ images, onChange, onUpload }) => {
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      if (onUpload) {
        // Upload each file immediately and getting URLs
        const uploadPromises = selectedFiles.map(file => onUpload(file));
        const newUrls = await Promise.all(uploadPromises);
        const validUrls = newUrls.filter(url => !!url);
        onChange([...images, ...validUrls]);
      } else {
        // Fallback or legacy behavior: just using data URLs (temporary)
        const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
        onChange([...images, ...newUrls]);
      }
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFiles} className="file-input file-input-bordered mb-3 w-full" accept="image/*" />
      <div className="flex flex-wrap gap-4">
        {images.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="preview" className="w-24 h-24 object-cover rounded border border-gray-200" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
