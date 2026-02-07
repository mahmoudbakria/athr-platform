import { useUserLocationContext } from '@/context/UserLocationContext';

export function useUserLocation() {
    return useUserLocationContext();
}
