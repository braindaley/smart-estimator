import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ReadinessState {
  formData: Record<string, any>;
  setFormData: (step: string, data: any) => void;
  reset: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const initialState = {
  formData: {},
};

export const useReadinessStore = create<ReadinessState>()(
  persist(
    (set) => ({
      formData: {},
      _hasHydrated: false,
      setFormData: (step, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: data,
          },
        })),
      reset: () => set({ ...initialState, _hasHydrated: true }),
       setHasHydrated: (hydrated) => {
        set({
          _hasHydrated: hydrated,
        });
      },
    }),
    {
      name: 'readiness-storage',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
