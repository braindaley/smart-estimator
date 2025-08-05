import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface EstimatorState {
  formData: Record<string, any>;
  setFormData: (step: string, data: any) => void;
  reset: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const initialState = {
  formData: {},
};

export const useEstimatorStore = create<EstimatorState>()(
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
      name: 'estimator-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
