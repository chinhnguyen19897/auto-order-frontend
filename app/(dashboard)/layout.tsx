'use client'

import React from "react";
import {Sidebar} from "../../components/Sidebar/Sidebar";
import {SidebarStoreProvider} from "../../providers/sidebar-store-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <SidebarStoreProvider>
        <div className="app-shell">
            <Sidebar />
            <div className="main-area">{children}</div>
        </div>
      </SidebarStoreProvider>
    )
}