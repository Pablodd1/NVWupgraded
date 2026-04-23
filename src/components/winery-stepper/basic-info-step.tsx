import { Winery } from "@/app/interfaces";
import { MapSelector } from "../map/map-selector";
import { MultipleImageUpload } from "../Multi-image-upload";

type BasicInfoFormProps = {
  formData: Winery;
  setFormData: React.Dispatch<React.SetStateAction<Winery>>;
  onUpload: (file: File) => Promise<string>;
};

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, setFormData, onUpload }) => {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleNestedChange = (e: any, parent: keyof Winery, field: string) => {
    const { value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: val },
    }));
  };

  const updateLocation = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, latitude: lat, longitude: lng, address },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold">Winery Name</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Napa Valley Estate"
          className="input input-bordered"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      {/* Winery Photos Section */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold">Winery Photos (Main Display)</span>
        </label>
        <MultipleImageUpload
          images={formData.images || []}
          onChange={(images) => setFormData(prev => ({ ...prev, images }))}
          onUpload={onUpload}
        />
        <label className="label">
          <span className="label-text-alt text-info">Add photos of your winery, estate, and vineyards. These will be shown on your profile.</span>
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold">Description</span>
        </label>
        <textarea
          name="description"
          placeholder="Tell guests about your history and wines..."
          className="textarea textarea-bordered h-24"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="contact@winery.com"
            className="input input-bordered"
            value={formData.contact_info.email}
            onChange={(e) => handleNestedChange(e, "contact_info", "email")}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Phone</span>
          </label>
          <input
            type="text"
            name="phone"
            placeholder="+1 707 555-0123"
            className="input input-bordered"
            value={formData.contact_info.phone}
            onChange={(e) => handleNestedChange(e, "contact_info", "phone")}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Website</span>
          </label>
          <input
            type="url"
            name="website"
            placeholder="https://yourwinery.com"
            className="input input-bordered"
            value={formData.contact_info.website}
            onChange={(e) => handleNestedChange(e, "contact_info", "website")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label">
          <span className="label-text font-bold">Address & Location</span>
        </label>
        <MapSelector
          latitude={formData.location.latitude}
          longitude={formData.location.longitude}
          address={formData.location.address}
          onChange={updateLocation}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border">
          <label className="cursor-pointer label flex justify-between md:justify-start gap-4">
            <span className="label-text font-semibold">Mountain Location</span>
            <input
              type="checkbox"
              checked={formData.location.is_mountain_location}
              onChange={(e) => handleNestedChange(e, "location", "is_mountain_location")}
              className="checkbox checkbox-primary"
            />
          </label>
          <label className="cursor-pointer label flex justify-between md:justify-start gap-4">
            <span className="label-text font-semibold">Allows Children</span>
            <input
              type="checkbox"
              checked={formData.amenities.allows_children}
              onChange={(e) => handleNestedChange(e, "amenities", "allows_children")}
              className="checkbox checkbox-primary"
            />
          </label>
          <label className="cursor-pointer label flex justify-between md:justify-start gap-4">
            <span className="label-text font-semibold">Non-Drinker Friendly</span>
            <input
              type="checkbox"
              checked={formData.amenities.allows_non_drinkers}
              onChange={(e) => handleNestedChange(e, "amenities", "allows_non_drinkers")}
              className="checkbox checkbox-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
};