import { useState } from "react";

type MultiDateTimePickerProps = {
  dates: Date[];
  onChange: (dates: Date[]) => void;
};
export const MultiDateTimePicker: React.FC<MultiDateTimePickerProps> = ({ dates, onChange }) => {
  const [newDateTime, setNewDateTime] = useState("");
  const addDate = () => {
    if (newDateTime) {
      const date = new Date(newDateTime);
      if (!isNaN(date.getTime())) {
        onChange([...dates, date]);
        setNewDateTime("");
      }
    }
  };
  return (
    <div>
      <div className="space-y-2">
        {dates.map((d, i) => (
          <div key={i} className="flex items-center justify-between bg-base-200 p-2 rounded">
            <span className="text-sm">{d.toLocaleString()}</span>
            <button type="button" onClick={() => onChange(dates.filter((_, j) => j !== i))} className="btn btn-xs btn-error">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="datetime-local"
          className="input input-bordered flex-1"
          value={newDateTime}
          onChange={(e) => setNewDateTime(e.target.value)}
        />
        <button type="button" onClick={addDate} className="btn btn-primary">
          Add
        </button>
      </div>
    </div>
  );
};
