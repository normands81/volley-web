import { useState, useEffect } from 'react';

/**
 * Computes the full path for an asset, prepending the base URL.

 * 
 * @param path The path to the asset (e.g., '/images/logo.png')
 * @returns The full path including the base URL (e.g., '/volley/images/logo.png')
 */
export const getAssetPath = (path: string): string => {
    const baseUrl = import.meta.env.BASE_URL;
    // Ensure we don't double slash if baseUrl ends with / and path starts with /
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

