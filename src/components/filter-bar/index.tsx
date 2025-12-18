import { FC } from "react";
import { wineTypes, regions, specialFeatures, timeOptions } from "@/data/data";


interface FilterProps {
  filters: any;
  handleFilterChange: (event: { target: { name: string; value: any } }) => void;
  handleMultiSelect: (filterType: string, value: string) => void;
  resetFilters: () => void;
  toggleDropdown: () => void;
  isOpen: boolean;
  dropdownRef: React.RefObject<any>;
}

const FilterComponent: FC<FilterProps> = ({
  filters,
  handleFilterChange,
  handleMultiSelect,
  resetFilters,
  toggleDropdown,
  isOpen,
  dropdownRef,
}) => {
  return (
    <section className="lg:w-4/12 sm:w-full p-6 bg-base-100 shadow-glassmorphism rounded-2xl mb-8 lg:mb-0 space-y-6">
      <h2 className="text-3xl font-serif font-semibold text-center text-neutral">Explore Our Wines</h2>

      <div className="space-y-6">
        {/* Reset Filters Button */}
        <div className="flex justify-center">
          <button
            onClick={resetFilters}
            className="btn btn-outline bg-primary text-white text-sm px-6 py-3 rounded-full hover:bg-primary-focus focus:ring-2 focus:ring-primary transition-all ease-in-out duration-300"
            aria-label="Reset filters"
          >
            Reset Filters
          </button>
        </div>

        {/* Tasting Price Range Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Tasting Price Range</label>
          <div className="relative">
            <input
              type="range"
              name="tastingPrice"
              min="0"
              max="200"
              value={filters.tastingPrice || 200}
              onChange={(e) => handleFilterChange({ target: { name: e.target.name, value: Number(e.target.value) } })}
              className="range range-primary w-full"
              aria-label="Select tasting price range"
            />
            <div className="absolute flex justify-between w-full mt-2 text-sm text-neutral">
              <span>$0</span>
              <span>${filters.tastingPrice || 200}</span>
              <span>$200+</span>
            </div>
          </div>
        </div>

        {/* General Price Range Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Total Price Range</label>
          <div className="relative">
            <input
              type="range"
              name="price"
              min="0"
              max="200"
              value={filters.price}
              onChange={(e) => handleFilterChange({ target: { name: e.target.name, value: Number(e.target.value) } })}
              className="range range-primary w-full"
              aria-label="Select price range"
            />
            <div className="absolute flex justify-between w-full mt-2 text-sm text-neutral">
              <span>$0</span>
              <span>${filters.price}</span>
              <span>$200+</span>
            </div>
          </div>
        </div>

        {/* Wine Type Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Wine Type</label>
          <div className="flex flex-wrap gap-4">
            {wineTypes.map((wineType, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full text-sm transition-all duration-300 transform hover:scale-105 ${
                  filters.wineTypes.includes(wineType)
                    ? "bg-primary text-white shadow-md"
                    : "bg-base-100 text-neutral hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleMultiSelect("wineTypes", wineType)}
                aria-label={`Select ${wineType} wine`}
              >
                {wineType}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="space-y-4 relative" ref={dropdownRef}>
          <label className="text-lg font-medium text-neutral">Region</label>
          <div
            onClick={toggleDropdown}
            className="cursor-pointer flex justify-between items-center px-6 py-4 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary transition-all ease-in-out"
            aria-expanded={isOpen}
            aria-controls="region-dropdown"
            aria-label="Select regions"
          >
            <span className="block text-neutral">
              {filters.regions && filters.regions.length > 0 ? filters.regions.join(", ") : "Select Regions"}
            </span>
            <span className="material-icons">{isOpen ? "expand_less" : "expand_more"}</span>
          </div>

          {isOpen && (
            <div
              id="region-dropdown"
              className="absolute w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto transition-all ease-in-out"
            >
              <div className="p-4 space-y-2">
                {regions.map((region, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={region}
                      checked={filters.regions.includes(region)}
                      onClick={() => handleMultiSelect("regions", region)}
                      className="w-5 h-5 text-primary border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                    <label htmlFor={region} className="text-sm font-medium text-neutral">
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Special Features Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Special Features</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specialFeatures.map((feature, index) => (
              <button
                key={index}
                className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  filters.specialFeatures.includes(feature)
                    ? "bg-primary text-white shadow-md"
                    : "bg-base-100 text-neutral hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleMultiSelect("specialFeatures", feature)}
                aria-label={`Select feature: ${feature}`}
              >
                <span>{feature}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Wines Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Number of Wines</label>
          <input
            type="range"
            name="numberOfWines"
            min="1"
            max="10"
            value={filters.numberOfWines}
            onChange={(e) => handleFilterChange({ target: { name: e.target.name, value: Number(e.target.value) } })}
            className="range range-primary w-full"
            aria-label="Select number of wines"
          />
          <div className="flex justify-between text-sm text-neutral mt-2">
            <span>1 Wines</span>
            <span>{filters.numberOfWines} Wines</span>
            <span>10 Wines</span>
          </div>
        </div>

        {/* Tasting Experience Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Tasting Experience</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="multiple-tastings"
                checked={filters.multipleTastings || false}
                onChange={(e) => handleFilterChange({ target: { name: 'multipleTastings', value: e.target.checked } })}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="multiple-tastings" className="text-sm font-medium text-neutral">
                Multiple Tasting Options
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="food-pairings"
                checked={filters.foodPairings || false}
                onChange={(e) => handleFilterChange({ target: { name: 'foodPairings', value: e.target.checked } })}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="food-pairings" className="text-sm font-medium text-neutral">
                Food Pairings Available
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tours-available"
                checked={filters.toursAvailable || false}
                onChange={(e) => handleFilterChange({ target: { name: 'toursAvailable', value: e.target.checked } })}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="tours-available" className="text-sm font-medium text-neutral">
                Tours Available
              </label>
            </div>
          </div>
        </div>

        {/* Tasting Time Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-neutral">Tasting Time</label>
          <div className="space-y-2 flex items-center justify-between justify-center">
            {timeOptions.map((time, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={time}
                  name="time"
                  value={time}
                  checked={filters.time === time}
                  onChange={(e) => handleFilterChange({ target: { name: e.target.name, value: e.target.value } })}
                  className="radio radio-primary"
                  aria-label={`Select tasting time: ${time}`}
                />
                <label htmlFor={time} className="text-sm font-medium text-neutral">
                  {time}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterComponent;