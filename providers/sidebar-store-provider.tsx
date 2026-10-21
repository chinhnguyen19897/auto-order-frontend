'use client'

import { type ReactNode, createContext, useState, useContext } from 'react'
import { useStore } from 'zustand'

import {type SidebarStore, createSidebarStore} from "../stores/sidebar-store";


export type SidebarStoreApi = ReturnType<typeof createSidebarStore>

export const SidebarStoreContext = createContext<SidebarStoreApi | undefined>(undefined)


export interface SidebarStoreProviderProps {
  children: ReactNode
}


export const SidebarStoreProvider = ({children} : SidebarStoreProviderProps) => {
  const [store] = useState(() => createSidebarStore())

  return <SidebarStoreContext.Provider value={store}>{children}</SidebarStoreContext.Provider>
}


export const useSidebarStore = <T,>(selector: (store: SidebarStore) => T): T => {
  const sideBarStoreContext = useContext(SidebarStoreContext)
  if(!sideBarStoreContext) {
    throw new Error("useSidebarStore must be used within SidebarStoreProvider")
  }
  return useStore(sideBarStoreContext, selector)
}