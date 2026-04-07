import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <AdminSidebar />
      {/* Căn lề trái 64 (w-64 của sidebar) để nội dung không bị đè */}
      <main className="flex-1 ml-64 p-12 bg-surface min-h-screen relative">
        <Outlet />
      </main>
    </div>
  );
}