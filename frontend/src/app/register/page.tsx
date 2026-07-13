'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nickname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
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
          <h1 className="font-serif text-3xl text-ink mt-2">Đăng Ký Reader</h1>
          <p className="mt-1.5 text-xs text-ink/50 tracking-wider">
            Nhận avatar ếch xanh ngẫu nhiên và bắt đầu hành trình
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-center text-xs font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 p-3.5 text-center text-xs font-medium text-green-700 border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink/50 mb-1.5 font-semibold">
              Nickname (Độc bản)
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
              placeholder="ten nguoi dung doc ban"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink/50 mb-1.5 font-semibold">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
              placeholder="dia chi email cua ban"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            {loading ? 'ĐANG KHỞI TẠO...' : 'ĐĂNG KÝ'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/50">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-ink underline hover:text-ink/80 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
