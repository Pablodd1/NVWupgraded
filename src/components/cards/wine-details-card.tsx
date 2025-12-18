import React from "react";
import { Card } from "./card";
import { Badge } from "../badge/badge";

interface WineDetail {
  wine_id: string;
  name: string;
  type: string;
  year: number;
  tasting_notes: string;
  pairing_suggestions: string[];
}

interface WineDetailsCardProps {
  wine: WineDetail;
}

const WineDetailsCard = ({ wine }: WineDetailsCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif">{wine.name}</h3>
          <Badge variant="secondary">{wine.year}</Badge>
        </div>
        <Badge variant="outline" className="capitalize">
          {wine.type}
        </Badge>
        <p className="text-gray-600 italic">{wine.tasting_notes}</p>
        <div>
          <h4 className="font-medium mb-2">Pairs well with:</h4>
          <div className="flex flex-wrap gap-2">
            {wine.pairing_suggestions.map((pairing) => (
              <Badge key={pairing} variant="outline" className="capitalize">
                {pairing}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WineDetailsCard;
