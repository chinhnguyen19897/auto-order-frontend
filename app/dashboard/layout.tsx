'use client'

import React from "react";
import {Sidebar} from "../../components/Sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-area">{children}</div>
        </div>
    )
}