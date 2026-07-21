import React from 'react';
import { User } from 'lucide-react';

const Header = () => {
    // Mock data - nantinya ini diambil dari global state (Zustand) / auth provider
    const user = {
        name: 'Praditya Ivan Rahmadhani',
        role: 'Front End Boys'
    };

    return (
        <header className="h-16 flex px-4 items-center justify-end border-b border-slate-500 bg-white shrink-0">
            <div className="h-full flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-black leading-none mb-1">
                        {user.name}
                    </span>
                    <span className="text-xs font-normal text-slate-500 leading-none">
                        {user.role}
                    </span>
                </div>
                
                {/* Avatar Placeholder */}
                <div className="h-fit w-auto p-3 aspect-square rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Header;