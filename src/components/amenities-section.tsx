import React from 'react';
import { Check, X } from 'lucide-react';
import { Card } from './cards/card';

interface AmenitiesProps {
  amenities: {
    virtual_sommelier: boolean;
    augmented_reality_tours: boolean;
    handicap_accessible: boolean;
  };
}

const AmenitiesSection = ({ amenities }: AmenitiesProps) => {
  const amenityList = [
    { name: 'Virtual Sommelier', value: amenities.virtual_sommelier },
    { name: 'AR Tours', value: amenities.augmented_reality_tours },
    { name: 'Handicap Accessible', value: amenities.handicap_accessible },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-serif text-xl mb-4">Amenities</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {amenityList.map((amenity) => (
          <div
            key={amenity.name}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
          >
            {amenity.value ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
            <span>{amenity.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AmenitiesSection;