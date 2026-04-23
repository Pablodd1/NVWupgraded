"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const AddressAutocomplete = ({
    value,
    onChange,
    placeholder = "Enter address...",
    className = "",
    required = false
}: AddressAutocompleteProps) => {
    const [inputValue, setInputValue] = useState(value);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        try {
            const options = {
                fields: ['address_components', 'geometry', 'formatted_address'],
                types: ['address'],
            };

            // @ts-ignore - Google Maps types might conflict
            autoCompleteRef.current = new places.Autocomplete(inputRef.current, options);

            autoCompleteRef.current.addListener('place_changed', () => {
                const place = autoCompleteRef.current?.getPlace();
                if (place?.formatted_address && place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setInputValue(place.formatted_address);
                    onChange(place.formatted_address, lat, lng);
                } else if (place?.formatted_address) {
                    // Fallback if geometry is missing but address is there
                    setInputValue(place.formatted_address);
                    onChange(place.formatted_address);
                }
            });
        } catch (error) {
            console.error("Google Maps Autocomplete failed:", error);
        }

        return () => {
            if (autoCompleteRef.current) {
                try {
                    google.maps.event.clearInstanceListeners(autoCompleteRef.current);
                } catch (e) {}
            }
        };
    }, [places]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        // Important: if user manually types, we clear coordinates to force a search/selection
        onChange(val, undefined, undefined);
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={className}
            required={required}
            autoComplete="off"
        />
    );
};
