import { Winery } from "@/app/interfaces";
import { ChangeEvent } from "react";
import { MapSelector } from "../map/map-selector";

type BasicInfoFormProps = {
  formData: Winery;
  setFormData: React.Dispatch<React.SetStateAction<Winery>>;
};

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, setFormData }) => {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleNestedChange = (e: any, parent: keyof Winery, field: string) => {
    const { value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [parent]: { ...(formData[parent] as any), [field]: val } });
  };

  const updateLocation = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, latitude: lat, longitude: lng, address },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Basic & Contact Info */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Winery Name</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="Winery name"
          className="input input-bordered"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          placeholder="Description"
          className="textarea textarea-bordered"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered"
            value={formData.contact_info.email}
            onChange={(e) => handleNestedChange(e, "contact_info", "email")}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone</span>
          </label>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="input input-bordered"
            value={formData.contact_info.phone}
            onChange={(e) => handleNestedChange(e, "contact_info", "phone")}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Website</span>
          </label>
          <input
            type="url"
            name="website"
            placeholder="Website"
            className="input input-bordered"
            value={formData.contact_info.website}
            onChange={(e) => handleNestedChange(e, "contact_info", "website")}
          />
        </div>
      </div>
      {/* Location */}
      <div className="space-y-2">
        <label className="label">
          <span className="label-text">Address</span>
        </label>
        <MapSelector latitude={formData.location.latitude} longitude={formData.location.longitude} onChange={updateLocation} />
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">Is Mountain Location?</span>
            <input
              type="checkbox"
              checked={formData.location.is_mountain_location}
              onChange={(e) => handleNestedChange(e, "location", "is_mountain_location")}
              className="checkbox"
            />
          </label>
        </div>
      </div>
    </div>
  );
};