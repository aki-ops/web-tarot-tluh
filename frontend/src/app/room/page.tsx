'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function RoomEntryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; nickname: string; avatarUrl: string } | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || roomCode.trim().length !== 6) {
      setError('Mã phòng phải có đúng 6 ký tự');
      return;
    }
    router.push(`/room/${roomCode.trim().toUpperCase()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập lại để thực hiện');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Khởi tạo phòng thất bại');
      }

      router.push(`/room/${data.code}`);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-10 rounded-3xl border border-ink/10 bg-cream/35 p-10 backdrop-blur-sm">
        
        {/* Cột 1: Tạo phòng (Yêu cầu đăng nhập) */}
        <div className="flex flex-col justify-between border-b border-ink/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10">
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 flex items-center gap-1.5 font-semibold">
              Khởi Tạo Phòng 🐸
            </h2>
            <p className="text-sm leading-relaxed text-ink/75 mb-6">
              Khởi tạo không gian Tarot đàm thoại riêng qua WebRTC P2P. Bạn đóng vai trò Reader giữ quyền xào và rút bài.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-center text-xs font-semibold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {user ? (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/60 p-4 border border-ink/5 mb-2">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-ink/10 bg-cream">
                  <Image
                    src={user.avatarUrl || '/images/avatars/frog1.png'}
                    alt={user.nickname}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink/40 font-bold">Chủ phòng</p>
                  <p className="text-sm font-bold text-ink">{user.nickname}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2 font-bold">
                  Tên phòng (Không bắt buộc)
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
                  placeholder={`Phong Tarot cua ${user.nickname}`}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>

              <Button type="submit" variant="pill" className="w-full h-11 mt-2 text-xs font-bold" disabled={loading}>
                {loading ? 'ĐANG KHỞI TẠO...' : 'TẠO PHÒNG MỚI'}
              </Button>
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white/30 p-6 text-center flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-3xl mb-2.5">🔒</span>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Bạn cần đăng nhập tài khoản để trở thành Reader khởi tạo phòng.
              </p>
              <Link href="/login" className="w-full">
                <Button variant="pill" size="sm" className="w-full h-10 text-xs font-bold">
                  ĐĂNG NHẬP NGAY
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Cột 2: Tham gia phòng (Không yêu cầu đăng nhập) */}
        <div className="flex flex-col justify-between pt-2 md:pt-0 md:pl-2">
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 font-semibold">Tham Gia Phòng</h2>
            <p className="text-sm leading-relaxed text-ink/75 mb-6">
              Bạn nhận được mã số 6 ký tự? Nhập mã vào bên dưới để gia nhập phòng thoại Tarot và luận giải ngay lập tức.
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2 font-bold">
                Mã phòng (Gồm 6 ký tự)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-center text-base font-bold tracking-[0.3em] uppercase text-ink placeholder:text-ink/30 focus:border-ink/30 focus:outline-none transition-colors"
                placeholder="ABCXYZ"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>

            <Button type="submit" variant="pill" className="w-full h-11 mt-2 text-xs font-bold">
              VÀO PHÒNG NGAY
            </Button>
          </form>

          {!user && (
            <p className="text-xs text-center text-ink/50 mt-6 leading-relaxed italic">
              * Khách (Guest) tham gia sẽ được tự động gán biệt danh ngẫu nhiên (ví dụ: guest_1).
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
