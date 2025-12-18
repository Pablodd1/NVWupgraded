"use client";
import { Winery } from "@/app/interfaces";
import { useItinerary } from "@/store/itinerary";
import Link from "next/link";
import { FC } from "react";
import { FaWineBottle, FaDollarSign, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

interface WineryCardProps {
  winery: Winery;
  addToItinerary: (winery: Winery) => void;
}

const WineryCard: FC<WineryCardProps> = ({ winery, addToItinerary }) => {
  const { itinerary } = useItinerary();
  const isAdded = itinerary.find((item) => item._id === winery._id);

  // Get WhatsApp contact if available (assumes winery.whatsapp holds the number)
  const whatsappNumber = winery.contact_info.phone;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "";

  // Handle multiple tastings
  const hasMultipleTastings = winery.tasting_info && winery.tasting_info.length > 1;
  const tastingPrices = winery.tasting_info?.map(t => t.tasting_price) || [];
  const minPrice = Math.min(...tastingPrices);
  const maxPrice = Math.max(...tastingPrices);
  const priceDisplay = hasMultipleTastings 
    ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
    : `$${winery.tasting_info?.[0]?.tasting_price?.toFixed(2) ?? "N/A"}`;

  // Get all wine types from all tastings
  const allWineTypes = winery.tasting_info?.flatMap(t => t.wine_types) || [];
  const uniqueWineTypes = [...new Set(allWineTypes)];

  return (
    <div className="flex flex-col sm:flex-row items-stretch rounded-xl bg-wine-background transition-all hover:shadow-neumorphismHover ease-in-out duration-300">
      <div className="w-full sm:w-1/3 h-40 sm:h-auto overflow-hidden lg:rounded-l-xl rounded-t-xl">
        <Link href={`/winery/${winery._id}`}>
          {winery.tasting_info?.[0]?.images?.[0] ? (
            <img
              src={winery.tasting_info?.[0]?.images?.[0]}
              alt={winery.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
        </Link>
      </div>

      <div className="p-4 sm:p-6 flex flex-col justify-between w-full sm:w-2/3 text-wine-text">
        <div className="mb-2">
          <Link href={`/winery/${winery._id}`}>
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-wine-primary truncate">
              {winery.name}
            </h2>
          </Link>
          <p className="text-sm text-wine-secondary truncate">{winery.description}</p>
          
          {/* Multiple Tasting Indicator */}
          {hasMultipleTastings && (
            <div className="mt-2">
              <span className="inline-block bg-wine-primary/10 text-wine-primary text-xs px-2 py-1 rounded-full">
                {winery.tasting_info.length} Tasting Options Available
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-neutral">
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-wine-accent" />
            <p className="truncate">{winery.location.address}</p>
          </div>

          <div className="flex items-center space-x-2">
            <FaDollarSign className="text-wine-accent" />
            <p>{priceDisplay}</p>
          </div>

          <div className="flex items-center space-x-2 capitalize">
            <FaWineBottle className="text-wine-accent" />
            <p>
              {uniqueWineTypes && uniqueWineTypes.length > 0 
                ? `${uniqueWineTypes.slice(0, 2).join(", ")}${uniqueWineTypes.length > 2 ? "..." : ""}`
                : "N/A"
              }
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={!!isAdded}
            className={`py-2 px-4 ${!!isAdded ? "bg-[#bebebe]" : "bg-wine-primary"} text-wine-background font-medium rounded-md ${
              !isAdded && "hover:bg-primary-focus"
            } transition-all duration-300`}
            onClick={() => addToItinerary(winery)}
          >
            {!!isAdded ? "Added!" : "Add to Itinerary"}
          </button>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-all duration-300 flex items-center"
            >
              <FaWhatsapp className="mr-2" />
              Chat
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineryCard;
