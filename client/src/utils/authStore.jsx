import { create } from "zustand";// it is used for state management 
import { persist } from "zustand/middleware";// used to make login peristance even after refresh 

const useAuthStore = create(
  persist((set) => ({//persist is a middleware - it automatically saves the state to the browser local storage whenever it changes
    currentUser: null,
    setCurrentUser: (newUser) => set({ currentUser: newUser }),
    removeCurrentUser: () => set({ currentUser: null }),
    updateCurrentUser: (updatedUser) => set({ currentUser: updatedUser }),
  }))
);

export default useAuthStore;