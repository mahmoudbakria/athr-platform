'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserLocationState {
    userCoords: { lat: number; lng: number } | null;
    error: string | null;
    loading: boolean;
}

const UserLocationContext = createContext<UserLocationState | undefined>(undefined);

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
    const [locationState, setLocationState] = useState<UserLocationState>({
        userCoords: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationState({
                userCoords: null,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationState({
                    userCoords: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location unavailable';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'Location request timed out';
                }

                setLocationState({
                    userCoords: null,
                    error: errorMessage,
                    loading: false,
                });
            }
        );
    }, []);

    return (
        <UserLocationContext.Provider value={locationState}>
            {children}
        </UserLocationContext.Provider>
    );
}

export function useUserLocationContext() {
    const context = useContext(UserLocationContext);
    if (context === undefined) {
        throw new Error('useUserLocationContext must be used within a UserLocationProvider');
    }
    return context;
}
