import {createStore} from "zustand/vanilla";
import {DashboardData} from "../types/common";
import {Tab} from "../types/tabs";

export type SidebarState = {
  tabs: string | Tab,
  isAuthenticated: boolean
  data: DashboardData | null
}

export type SidebarActions = {
  setTabs: (tabs: SidebarState['tabs']) => void
  setData: (data: SidebarState['data']) => void
  logoutPage: (
    action: () => Promise<unknown>,
    success: string
  ) => Promise<boolean>;
}

export type SidebarStore = SidebarState & SidebarActions


export const defaultInitState: SidebarState = {
  tabs: "live",
  isAuthenticated: true,
  data: null
}


export const createSidebarStore = (initState: SidebarState = defaultInitState) => {
  return createStore<SidebarStore>()((set) => ({
      ...initState,
      setTabs: (tabs) => set(() => ({tabs: tabs})),
      setData: (data) => set(() => ({data: data})),
      logoutPage: async (action, success) => {
        try {
          await action();

          set({
            isAuthenticated: false,
          });

          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    })
  )
}