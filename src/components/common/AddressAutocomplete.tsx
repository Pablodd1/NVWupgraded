"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    placeholder?: string;
    className?: string;
}

export const AddressAutocomplete = ({
    value,
    onChange,
    placeholder = "Enter address...",
    className = ""
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

        const options = {
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address'],
        };

        autoCompleteRef.current = new places.Autocomplete(inputRef.current, options);

        autoCompleteRef.current.addListener('place_changed', () => {
            const place = autoCompleteRef.current?.getPlace();
            if (place?.formatted_address) {
                setInputValue(place.formatted_address);
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                onChange(place.formatted_address, lat, lng);
            }
        });

        return () => {
            if (autoCompleteRef.current) {
                google.maps.event.clearInstanceListeners(autoCompleteRef.current);
            }
        };
    }, [places]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={className}
        />
    );
};
