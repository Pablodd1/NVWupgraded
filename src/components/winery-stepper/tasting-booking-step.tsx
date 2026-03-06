import { ChangeEvent, useState } from "react";
import { MultiDateTimePicker } from "../datetime-picker";
import { Winery, TastingInfo, Tours, WineDetail, BookingInfo, FoodPairingOption } from "@/app/interfaces";
import { MultipleImageUpload } from "../Multi-image-upload";
import { timeOptions, wineTypes, specialFeatures, regions } from "@/data/data";
import Select from "react-select";
import { FaMapMarkerAlt, FaWineBottle, FaTrash, FaPlus, FaImage } from "react-icons/fa";

type TastingBookingFormProps = {
  formData: Winery;
  setFormData: React.Dispatch<React.SetStateAction<Winery>>;
  onUpload: (file: File) => Promise<string>;
};

export const TastingBookingForm: React.FC<TastingBookingFormProps> = ({
  formData,
  setFormData,
  onUpload,
}) => {
  const [foodPairingOption, setFoodPairingOption] = useState<FoodPairingOption>({ id: "", name: "", price: 0 });
  const [tourOption, setTourOption] = useState<{ description: string; cost: number }>({ description: "", cost: 0 });
  const [newWine, setNewWine] = useState<WineDetail>({ id: "", name: "", description: "", year: undefined, tasting_notes: "", photo: "" });
  const [isUploadingWinePhoto, setIsUploadingWinePhoto] = useState(false);

  const handleTastingChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updatedTastings = [...prev.tasting_info];
      updatedTastings[index] = { ...updatedTastings[index], [field]: value };
      return { ...prev, tasting_info: updatedTastings };
    });
  };

  const addTasting = () => {
    setFormData((prev) => ({
      ...prev,
      tasting_info: [
        ...prev.tasting_info,
        {
          tasting_title: "",
          tasting_description: "",
          pricing_model: "per_person",
          tasting_price: 0,
          available_times: [],
          wine_types: [],
          number_of_wines_per_tasting: 1,
          special_features: [],
          images: [],
          food_pairing_options: [],
          ava: "",
          tours: { available: false, tour_price: 0, tour_options: [] },
          wine_details: [],
          booking_info: {
            booking_enabled: false,
            max_guests_per_slot: 0,
            number_of_people: [1, 10],
            dynamic_pricing: { enabled: false, weekend_multiplier: 1 },
            available_slots: [],
            external_booking_link: "",
          },
          other_features: [],
          base_booking_fee: 0,
          additional_guest_fee: 0,
          free_guests_included: 1,
          child_price: 0,
          non_drinker_price: 0,
        },
      ],
    }));
  };

  const removeTasting = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tasting_info: prev.tasting_info.filter((_, i) => i !== index),
    }));
  };

  const handleWinePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingWinePhoto(true);
      try {
        const url = await onUpload(file);
        setNewWine(prev => ({ ...prev, photo: url }));
      } finally {
        setIsUploadingWinePhoto(false);
      }
    }
  };

  const addWine = (index: number) => () => {
    if (newWine.name && newWine.description) {
      setFormData((prev) => {
        const updatedTastings = [...prev.tasting_info];
        updatedTastings[index] = {
          ...updatedTastings[index],
          wine_details: [
            ...(updatedTastings[index].wine_details || []),
            {
              id: crypto.randomUUID(),
              name: newWine.name,
              description: newWine.description,
              year: newWine.year,
              tasting_notes: newWine.tasting_notes,
              photo: newWine.photo,
            },
          ],
        };
        return { ...prev, tasting_info: updatedTastings };
      });
      setNewWine({ id: "", name: "", description: "", year: undefined, tasting_notes: "", photo: "" });
    }
  };

  const removeWine = (tastingIndex: number, wineId: string) => {
    setFormData((prev) => {
      const updatedTastings = [...prev.tasting_info];
      updatedTastings[tastingIndex] = {
        ...updatedTastings[tastingIndex],
        wine_details: updatedTastings[tastingIndex].wine_details.filter((wine) => wine.id !== wineId),
      };
      return { ...prev, tasting_info: updatedTastings };
    });
  };

  return (
    <div className="space-y-8">
      {formData.tasting_info.map((tasting, index) => (
        <div key={index} className="card bg-white shadow-xl p-6 border-t-4 border-primary relative overflow-visible">
          <button
            type="button"
            onClick={() => removeTasting(index)}
            className="absolute -top-3 -right-3 btn btn-circle btn-error btn-sm shadow-xl border-2 border-white"
          >
            <FaTrash size={12} />
          </button>

          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{index + 1}</span>
            Tasting Package Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Tasting Title</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Signature Flight"
                className="input input-bordered"
                value={tasting.tasting_title}
                onChange={(e) => handleTastingChange(index, "tasting_title", e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">AVA Region</span>
              </label>
              <Select
                options={regions.map((region) => ({ label: region, value: region }))}
                value={{ label: tasting.ava, value: tasting.ava }}
                onChange={(e) => handleTastingChange(index, "ava", e?.value)}
                placeholder="Select AVA Region"
              />
            </div>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-bold">Tasting Description</span>
            </label>
            <textarea
              placeholder="Tell guests what makes this experience special..."
              className="textarea textarea-bordered h-24"
              value={tasting.tasting_description}
              onChange={(e) => handleTastingChange(index, "tasting_description", e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-4">
            <h4 className="font-bold mb-4 text-gray-800">Pricing {"&"} Capacity Model</h4>
            <div className="flex gap-4 mb-6">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name={`pricing_${index}`}
                  className="radio radio-primary"
                  checked={tasting.pricing_model !== 'base_fee'}
                  onChange={() => handleTastingChange(index, 'pricing_model', 'per_person')}
                />
                <span>Per Person Fee (Guest Fee)</span>
              </label>
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name={`pricing_${index}`}
                  className="radio radio-primary"
                  checked={tasting.pricing_model === 'base_fee'}
                  onChange={() => handleTastingChange(index, 'pricing_model', 'base_fee')}
                />
                <span>Base Booking Fee (Flat Rate)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tasting.pricing_model === 'base_fee' ? (
                <>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold text-xs uppercase">Base Booking Fee ($)</span></label>
                    <input
                      type="number" placeholder="0" className="input input-bordered"
                      value={tasting.base_booking_fee || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleTastingChange(index, "base_booking_fee", val);
                        handleTastingChange(index, "tasting_price", val); // Keep search sync
                      }}
                      min={0}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold text-xs uppercase">Guests Included In Base</span></label>
                    <input
                      type="number" placeholder="1" className="input input-bordered"
                      value={tasting.free_guests_included || ""}
                      onChange={(e) => handleTastingChange(index, "free_guests_included", parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold text-xs uppercase">Extra Guest Fee ($)</span></label>
                    <input
                      type="number" placeholder="0" className="input input-bordered"
                      value={tasting.additional_guest_fee || ""}
                      onChange={(e) => handleTastingChange(index, "additional_guest_fee", parseFloat(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                </>
              ) : (
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold text-xs uppercase">Per Person Guest Fee ($)</span></label>
                  <input
                    type="number" placeholder="0" className="input input-bordered"
                    value={tasting.tasting_price || ""}
                    onChange={(e) => handleTastingChange(index, "tasting_price", parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              )}
            </div>

            <div className="divider my-4">Guest Capacity {"&"} Addons</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold text-xs uppercase">Total Guest Capacity (Hard Limit)</span></label>
                <input
                  type="number" placeholder="Max limit" className="input input-bordered"
                  value={tasting.booking_info?.max_guests_per_slot || ""}
                  onChange={(e) => {
                    const bookingInfo = { ...tasting.booking_info, max_guests_per_slot: parseInt(e.target.value) || 0 };
                    handleTastingChange(index, "booking_info", bookingInfo);
                  }}
                  min={0}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold text-xs uppercase">Non-Drinker Fee ($)</span></label>
                <input
                  type="number" placeholder="0" className="input input-bordered"
                  value={tasting.non_drinker_price || ""}
                  onChange={(e) => handleTastingChange(index, "non_drinker_price", parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold text-xs uppercase">Underage Kids Fee ($)</span></label>
                <input
                  type="number" placeholder="0" className="input input-bordered"
                  value={tasting.child_price || ""}
                  onChange={(e) => handleTastingChange(index, "child_price", parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="form-control mt-6">
            <label className="label">
              <span className="label-text font-bold">Tasting Images</span>
            </label>
            <MultipleImageUpload
              images={tasting.images || []}
              onChange={(images) => handleTastingChange(index, "images", images)}
              onUpload={onUpload}
            />
          </div>

          <div className="divider my-8">Experience Settings</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Wine Categories</span>
              </label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-gray-50">
                {wineTypes.map((type) => (
                  <label key={type} className="label cursor-pointer justify-start gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={tasting.wine_types.includes(type)}
                      onChange={(e) => {
                        const updatedTypes = e.target.checked
                          ? [...tasting.wine_types, type]
                          : tasting.wine_types.filter((t) => t !== type);
                        handleTastingChange(index, "wine_types", updatedTypes);
                      }}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-xs font-semibold">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Special Amenities</span>
              </label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-gray-50">
                {specialFeatures.map((feature) => (
                  <label key={feature} className="label cursor-pointer justify-start gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm hover:border-secondary transition-colors">
                    <input
                      type="checkbox"
                      checked={tasting.special_features.includes(feature)}
                      onChange={(e) => {
                        const updatedFeatures = e.target.checked
                          ? [...tasting.special_features, feature]
                          : tasting.special_features.filter((f) => f !== feature);
                        handleTastingChange(index, "special_features", updatedFeatures);
                      }}
                      className="checkbox checkbox-secondary checkbox-sm"
                    />
                    <span className="text-xs font-semibold">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="divider my-8">Availability & Capacity</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Operating Hours / Slots</span>
              </label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-primary/5 border-primary/10">
                {timeOptions.map((time) => (
                  <label key={time} className="label cursor-pointer justify-start gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={tasting.available_times.includes(time)}
                      onChange={(e) => {
                        const updatedTimes = e.target.checked
                          ? [...tasting.available_times, time]
                          : tasting.available_times.filter((t) => t !== time);
                        handleTastingChange(index, "available_times", updatedTimes);
                      }}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-xs font-bold">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Capacity control and excess guest booking fields removed per user request */}
            </div>
          </div>

          <div className="divider my-8">Wines & Menu</div>

          <div className="bg-gray-50 rounded-2xl p-6 border">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <FaWineBottle className="text-primary" /> Curate Your Flight
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs font-bold uppercase">Wine Name</span></label>
                <input type="text" className="input input-bordered input-sm" value={newWine.name} onChange={(e) => setNewWine({ ...newWine, name: e.target.value })} placeholder="e.g. Reserve Cab" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs font-bold uppercase">Vintage Year</span></label>
                <input type="number" className="input input-bordered input-sm" value={newWine.year || ""} onChange={(e) => setNewWine({ ...newWine, year: parseInt(e.target.value) || undefined })} placeholder="2021" />
              </div>
              <div className="form-control lg:col-span-2">
                <label className="label"><span className="label-text text-xs font-bold uppercase">Tasting Notes</span></label>
                <input type="text" className="input input-bordered input-sm" value={newWine.tasting_notes} onChange={(e) => setNewWine({ ...newWine, tasting_notes: e.target.value })} placeholder="Notes of black cherry and oak..." />
              </div>
              <div className="form-control lg:col-span-3">
                <label className="label"><span className="label-text text-xs font-bold uppercase">Brief Story / Description</span></label>
                <input type="text" className="input input-bordered input-sm" value={newWine.description} onChange={(e) => setNewWine({ ...newWine, description: e.target.value })} placeholder="Small batch from our East hillside..." />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs font-bold uppercase">Bottle Photo</span></label>
                <div className="flex gap-2">
                  <input type="file" id={`wine-photo-${index}`} className="hidden" accept="image/*" onChange={handleWinePhotoUpload} />
                  <label htmlFor={`wine-photo-${index}`} className={`btn btn-sm btn-outline flex-grow ${isUploadingWinePhoto ? 'loading' : ''}`}>
                    {newWine.photo ? 'Photo Added' : 'Add Photo'}
                  </label>
                  {newWine.photo && <div className="avatar"><div className="w-8 rounded"><img src={newWine.photo} alt="mini preview" /></div></div>}
                </div>
              </div>
            </div>

            <button type="button" onClick={addWine(index)} className="btn btn-primary btn-sm gap-2">
              <FaPlus /> Add Wine to Flight
            </button>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasting.wine_details.map((wine) => (
                <div key={wine.id} className="bg-white p-4 rounded-xl border shadow-sm relative group">
                  <button onClick={() => removeWine(index, wine.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={12} /></button>
                  <div className="flex gap-3">
                    {wine.photo && <img src={wine.photo} className="w-16 h-20 object-cover rounded-lg border shadow-inner" alt={wine.name} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-gray-900">{wine.name} {wine.year && <span className="text-primary">{wine.year}</span>}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-2 italic mt-1">{wine.tasting_notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addTasting}
        className="btn btn-outline btn-primary btn-block py-8 border-2 border-dashed flex flex-col gap-2 hover:bg-primary/5"
      >
        <FaPlus size={24} />
        <span className="font-black text-lg">Create Additional Experience Package</span>
      </button>
    </div>
  );
};