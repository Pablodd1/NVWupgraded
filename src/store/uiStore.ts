import { create } from 'zustand';

interface UIState {
    showVoiceSearch: boolean;
    toggleVoiceSearch: () => void;
    setShowVoiceSearch: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    showVoiceSearch: false,
    toggleVoiceSearch: () => set((state) => ({ showVoiceSearch: !state.showVoiceSearch })),
    setShowVoiceSearch: (show: boolean) => set({ showVoiceSearch: show }),
}));
