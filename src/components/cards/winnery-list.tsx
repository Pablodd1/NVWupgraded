"use client";
import { Winery } from "@/app/interfaces";
import { useItinerary } from "@/store/itinerary";
import Link from "next/link";
import { FC, memo } from "react";
import { FaWineBottle, FaDollarSign, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

interface WineryCardProps {
  winery: Winery;
  addToItinerary: (winery: Winery) => void;
  priority?: boolean;
}

const WineryCard: FC<WineryCardProps> = memo(({ winery, addToItinerary, priority }) => {
  const { itinerary } = useItinerary();
  const isAdded = itinerary.find((item) => item._id === winery._id);

  const whatsappNumber = winery.contact_info.phone;
  let formattedNumber = whatsappNumber ? whatsappNumber.replace(/\D/g, "") : "";
  if (formattedNumber.length === 10) {
    formattedNumber = "1" + formattedNumber;
  }
  const whatsappLink = formattedNumber ? `https://wa.me/${formattedNumber}` : "";

  const hasMultipleTastings = winery.tasting_info && winery.tasting_info.length > 1;
  const tastingPrices = winery.tasting_info?.map(t => t.tasting_price) || [];
  const minPrice = tastingPrices.length > 0 ? Math.min(...tastingPrices) : 0;
  const maxPrice = tastingPrices.length > 0 ? Math.max(...tastingPrices) : 0;

  const priceDisplay = hasMultipleTastings
    ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
    : `$${winery.tasting_info?.[0]?.tasting_price?.toFixed(2) ?? "N/A"}`;

  const allWineTypes = winery.tasting_info?.flatMap(t => t.wine_types) || [];
  const uniqueWineTypes = [...new Set(allWineTypes)];

  return (
    <div className="flex flex-col sm:flex-row items-stretch rounded-2xl bg-white transition-all hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-100 ease-in-out duration-300 overflow-hidden mb-4">
      <div className="w-full sm:w-1/3 h-48 sm:h-auto overflow-hidden relative">
        <Link href={`/winery/${winery._id}`}>
          {winery.tasting_info?.[0]?.images?.[0] ? (
            <Image
              src={winery.tasting_info?.[0]?.images?.[0]}
              alt={winery.name}
              fill
              priority={priority}
              className="object-cover transform hover:scale-105 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </Link>
      </div>

      <div className="p-6 flex flex-col justify-between w-full sm:w-2/3">
        <div className="mb-4">
          <Link href={`/winery/${winery._id}`}>
            <h2 className="text-xl font-black text-gray-900 hover:text-primary transition-colors truncate">
              {winery.name}
            </h2>
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{winery.description}</p>

          {hasMultipleTastings && (
            <div className="mt-3">
              <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg">
                {winery.tasting_info.length} Tasting Experiences
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-primary/60" />
            <p className="truncate">{winery.location.address.split(',')[0]}</p>
          </div>


          <div className="flex items-center space-x-2">
            <FaDollarSign className="text-primary/60" />
            <p>{priceDisplay}</p>
          </div>

          <div className="flex items-center space-x-2 capitalize">
            <FaWineBottle className="text-primary/60" />
            <p className="truncate">
              {uniqueWineTypes && uniqueWineTypes.length > 0
                ? `${uniqueWineTypes.slice(0, 2).join(", ")}`
                : "Varietals"
              }
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/winery/${winery._id}`}
            className="py-3 px-6 rounded-xl font-bold transition-all duration-300 flex-1 sm:flex-none bg-gray-900 text-white hover:bg-primary shadow-lg shadow-gray-200 hover:shadow-primary/20 text-center flex items-center justify-center"
          >
            View Experience
          </Link>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center"
              title="Chat with Winery"
            >
              <FaWhatsapp size={20} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

WineryCard.displayName = "WineryCard";
export default WineryCard;
