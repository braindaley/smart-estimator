import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface EstimatorState {
  formData: Record<string, any>;
  setFormData: (step: string, data: any) => void;
  reset: () => void;
}

const initialState = {
  formData: {},
};

export const useEstimatorStore = create<EstimatorState>()(
  persist(
    (set) => ({
      ...initialState,
      setFormData: (step, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: data,
          },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'estimator-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
