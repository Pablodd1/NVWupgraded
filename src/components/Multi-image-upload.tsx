import { ChangeEvent } from "react";

type MultipleImageUploadProps = {
  files: File[];
  onChange: (files: File[]) => void;
};
export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({ files, onChange }) => {
  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange([...files, ...Array.from(e.target.files)]);
    }
  };
  return (
    <div>
      <input type="file" multiple onChange={handleFiles} className="file-input file-input-bordered mb-3" />
      <div className="flex flex-wrap gap-4">
        {files.map((file, i) => (
          <div key={i} className="relative">
            <img src={URL.createObjectURL(file)} alt="preview" className="w-24 h-24 object-cover rounded" />
            <button
              type="button"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute top-0 right-0 btn btn-xs btn-error"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
