import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Harap isi email dan password administrator.');
      return;
    }

    try {
      await login(email, password);
      setSuccessMsg('Verifikasi Admin Berhasil! Mengalihkan ke Dashboard...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Akses Ditolak: Kredensial tidak valid atau akun Anda bukan Administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-4 font-jakarta relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-neo-yellow border-3 border-neo-dark rounded-full opacity-40 blur-xs -z-10" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-neo-pink border-3 border-neo-dark rounded-full opacity-40 blur-xs -z-10" />

      <div className="w-full max-w-md">
        {/* Header Logo transparent */}
        <div className="text-center mb-6">
          <div className="inline-block p-2 mb-2">
            <img
              src="/eventify-logo.png"
              alt="Eventify Logo"
              className="h-20 mx-auto object-contain drop-shadow-[3px_3px_0px_#2B2630]"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-yellow rounded-md border-2 border-neo-dark font-space font-extrabold text-xs uppercase tracking-wider shadow-neo-sm">
            <ShieldCheck size={14} className="text-neo-dark" /> PORTAL KHUSUS ADMINISTRATOR
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-neo-lg border-3 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin Verification Notice */}
            <div className="p-3 bg-neo-mint/30 rounded-xl border-2 border-neo-dark text-xs font-semibold text-neo-dark flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-800 shrink-0" />
              <span>Sistem terverifikasi: Hanya akun bertipe <strong>"admin"</strong> yang diizinkan mengakses portal ini.</span>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 bg-neo-pink text-neo-dark border-2.5 border-neo-dark rounded-xl shadow-neo-sm font-jakarta text-xs font-extrabold flex items-center gap-2.5 animate-bounce">
                <ShieldAlert size={20} className="shrink-0 text-neo-dark" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="p-3.5 bg-neo-mint text-neo-dark border-2.5 border-neo-dark rounded-xl shadow-neo-sm font-jakarta text-xs font-extrabold flex items-center gap-2.5">
                <CheckCircle2 size={20} className="shrink-0 text-neo-dark" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
                EMAIL ADMINISTRATOR
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neo-dark pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="admin@eventify.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 px-4 py-2.5 rounded-lg border-2.5 border-neo-dark bg-white font-jakarta text-neo-dark focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:shadow-neo transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
                PASSWORD ADMIN
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neo-dark pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border-2.5 border-neo-dark bg-white font-jakarta text-neo-dark focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:shadow-neo transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-neo-dark hover:text-black focus:outline-none p-1 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight size={20} />}
            >
              {isLoading ? 'Verifikasi Admin...' : 'Masuk Portal Admin'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

