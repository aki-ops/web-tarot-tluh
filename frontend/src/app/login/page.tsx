'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu trữ phiên đăng nhập
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Kích hoạt sự kiện đồng bộ header
      window.dispatchEvent(new Event('auth-change'));
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-cream/35 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <span className="text-2xl">🐸</span>
          <h1 className="font-serif text-3xl text-ink mt-2">Chào Tri Âm</h1>
          <p className="mt-1.5 text-xs text-ink/50 tracking-wider">
            Đăng nhập để khởi tạo không gian đàm thoại Tarot
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-center text-xs font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink/50 mb-1.5 font-semibold">
              Email hoặc Nickname
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
              placeholder="nhap email hoac nickname"
              value={form.usernameOrEmail}
              onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink/50 mb-1.5 font-semibold">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <Button type="submit" variant="pill" className="w-full mt-2 h-11" disabled={loading}>
            {loading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/50">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-ink underline hover:text-ink/80 transition-colors">
            Đăng ký làm Reader mới 🐸
          </Link>
        </p>
      </div>
    </div>
  );
}
