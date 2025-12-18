import React from "react";
import { CalendarDays } from "lucide-react";
import { Card } from "./cards/card";
import { Button } from "./buttons/button";

interface BookingCalendarProps {
  slots: string[];
  maxGuests: number;
  weekendMultiplier: number;
}

const BookingCalendar = ({ slots, maxGuests, weekendMultiplier }: BookingCalendarProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-wine-primary" />
        <h3 className="font-serif text-xl">Available Booking Slots</h3>
      </div>
      <div className="space-y-4">
        {slots?.map((slot) => (
          <div key={slot} className="border-b pb-4">
            <h4 className="font-medium mb-2">
              {new Date(slot).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button key={slot} variant="outline" className="hover:bg-wine-primary hover:text-white">
                {new Date(slot).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Maximum {maxGuests} guests per session</p>
        <p>Weekend pricing: {(weekendMultiplier * 100 - 100).toFixed(0)}% premium</p>
      </div>
    </Card>
  );
};

export default BookingCalendar;
