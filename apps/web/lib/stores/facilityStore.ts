import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility } from '@/lib/api/client/models/Facility';

interface FacilityState {
  activeFacilityId: string | null;
  facilities: Facility[];
  isLoading: boolean;
  error: string | null;
  isFacilityModalOpen: boolean;
  
  // Actions
  setActiveFacilityId: (facilityId: string | null) => void;
  setFacilities: (facilities: Facility[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openFacilityModal: () => void;
  closeFacilityModal: () => void;
  selectFacility: (facilityId: string) => void;
  isFacilityRequired: () => boolean;
}

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set, get) => ({
      activeFacilityId: null,
      facilities: [],
      isLoading: false,
      error: null,
      isFacilityModalOpen: false,

      setActiveFacilityId: (facilityId) => set({ activeFacilityId: facilityId }),
      setFacilities: (facilities) => set({ facilities }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      openFacilityModal: () => set({ isFacilityModalOpen: true }),
      closeFacilityModal: () => set({ isFacilityModalOpen: false }),
      selectFacility: (facilityId) => {
        set({ activeFacilityId: facilityId, isFacilityModalOpen: false });
      },
      isFacilityRequired: () => {
        const state = get();
        return state.facilities.length > 0 && !state.activeFacilityId;
      },
    }),
    {
      name: 'facility-store',
      partialize: (state) => ({ activeFacilityId: state.activeFacilityId }),
    }
  )
); 