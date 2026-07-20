import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            FlowDoc
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Masuk untuk mengakses kanvas simulasimu
          </p>
        </div>
        
        {/* Konten spesifik Login atau Register akan dirender di sini */}
        <Outlet />
      </div>
    </div>
  );
}