"use client";
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Napa Valley coordinates
        const lat = 38.2975;
        const lon = -122.2869;

        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(res => res.json())
            .then(data => {
                setWeather(data.current_weather);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !weather) return null;

    const getIcon = (code: number) => {
        if (code === 0) return <Sun className="text-yellow-400" />;
        if (code > 0 && code < 45) return <Cloud className="text-gray-400" />;
        return <CloudRain className="text-blue-400" />;
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md mb-6">
            <div className="p-3 bg-gray-50 rounded-xl">
                {getIcon(weather.weathercode)}
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Napa Valley Forecast</p>
                <div className="flex items-center gap-2">
                    <h4 className="text-xl font-black text-gray-900">{weather.temperature}°C</h4>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Thermometer size={12} /> Live
                    </span>
                </div>
            </div>
        </div>
    );
}
