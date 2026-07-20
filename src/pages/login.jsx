import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
// Jika kamu pakai Shadcn, ganti tag standar ini dengan komponen UI-mu

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // NANTI: Ganti dengan panggilan Axios ke API aslimu
        // const response = await apiClient.post('/auth/login', { email, password });
        
        // SIMULASI API CALL (Hapus ini nanti)
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (email !== 'test@flowdoc.com' || password !== 'password123') {
            throw new Error('Kredensial tidak valid');
        }
        const mockToken = 'jwt-token-palsu-123';
        const mockUser = { name: 'Praditya', email: 'test@flowdoc.com' };

        // Lempar ke Zustand
        login(mockToken, mockUser);
        
        // Router otomatis menendang ke '/' karena state isAuthenticated berubah
        } catch (err) {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900">
                {error}
                </div>
            )}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-start text-zinc-700 dark:text-zinc-300">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-transparent text-zinc-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="test@flowdoc.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-start text-zinc-700 dark:text-zinc-300">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-transparent text-zinc-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Memproses...' : 'Masuk ke FlowDoc'}
            </button>
        </form>
    );
}