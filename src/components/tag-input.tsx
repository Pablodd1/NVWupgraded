import { useState } from "react";

type TagInputProps = {
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
};
export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState("");
  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };
  return (
    <div className="border rounded p-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="badge badge-primary">
            {tag}
            <button type="button" className="btn btn-xs btn-ghost ml-1" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="input input-bordered w-full mt-2"
        placeholder={placeholder || "Add tag & press Enter"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
      />
    </div>
  );
};
