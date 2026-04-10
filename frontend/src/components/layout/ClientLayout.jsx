import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';

export default function ClientLayout() {
    return (
        <div className="min-h-screen bg-background text-on-background flex flex-col">
            <ClientHeader />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <ClientFooter />
        </div>
    );
}