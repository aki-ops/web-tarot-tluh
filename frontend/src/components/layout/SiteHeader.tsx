'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/room', label: 'Phòng Đàm Thoại 🐸' },
  { href: '/rut-bai/qua-khu-hien-tai-tuong-lai', label: 'Chiêm Tinh Ba Ngôi' },
  { href: '/rut-bai/nhanh', label: 'Thông Điệp Ngày Mới' },
  { href: '/thu-vien-la-bai', label: 'Thư Viện' },
  { href: '/journal', label: 'Nhật Ký' },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white shadow-sm transition-all duration-300 group-hover:border-ink/40 group-hover:scale-105">
        <span className="font-serif text-sm text-ink/80">🐸</span>
      </div>
      <span className="font-sans text-sm sm:text-base font-bold tracking-[0.22em] text-ink uppercase">
        TLUH TAROT
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; nickname: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-white/40 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-12">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-xs md:text-sm uppercase tracking-[0.16em] text-ink/70 transition-all duration-200 hover:text-ink pb-1 border-b-[1.5px] border-transparent font-semibold',
                  isActive && 'text-ink font-bold border-ink/65'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {/* Thông tin User Đăng nhập */}
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-ink/10 bg-cream">
                <Image
                  src={user.avatarUrl || '/images/avatars/frog1.png'}
                  alt={user.nickname}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-semibold tracking-wider text-ink/80">{user.nickname}</span>
              <button
                onClick={handleLogout}
                className="ml-2 text-ink/40 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="pill" size="sm" className="h-8 px-4 text-xs tracking-wider">
                ĐĂNG NHẬP
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-ink/70"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ink/5 bg-white/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs uppercase tracking-[0.15em] text-ink/70 hover:bg-ink/5',
                  pathname === item.href && 'bg-ink/5 font-semibold text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User mobile panel */}
            <div className="border-t border-ink/5 pt-3 mt-1 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-7 w-7 overflow-hidden rounded-full border border-ink/10 bg-cream">
                      <Image
                        src={user.avatarUrl || '/images/avatars/frog1.png'}
                        alt={user.nickname}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold text-ink/80">{user.nickname}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-500 font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-9 rounded-xl text-xs tracking-wider">
                    ĐĂNG NHẬP
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
