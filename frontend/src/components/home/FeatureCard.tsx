import Link from 'next/link';
import { Layers, Sparkles, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    href: '/room',
    icon: Users,
    title: 'Phòng Đàm Thoại 🐸',
    description:
      'Kết nối bạn bè trò chuyện đàm thoại trực tuyến, cùng nhau xào bài và luận giải thông điệp.',
    cta: 'Tạo phòng thoại',
  },
  {
    href: '/rut-bai/qua-khu-hien-tai-tuong-lai',
    icon: Layers,
    title: 'Chiêm Tinh Ba Ngôi',
    description:
      'Trải bài Quá Khứ, Hiện Tại và Tương Lai — ba góc nhìn soi chiếu sâu sắc câu hỏi của bạn.',
    cta: 'Bắt đầu trải bài',
  },
  {
    href: '/rut-bai/nhanh',
    icon: Sparkles,
    title: 'Thông Điệp Ngày Mới',
    description: 'Một lá bài chỉ dẫn nhẹ nhàng cho ngày hôm nay, soi rọi tư duy và hành động.',
    cta: 'Nhận thông điệp',
  },
  {
    href: '/thu-vien-la-bai',
    icon: BookOpen,
    title: 'Cổ Thư Tarot',
    description: 'Thư viện tra cứu chi tiết biểu tượng và ý nghĩa huyền bí của 78 lá bài Kabala.',
    cta: 'Khám phá cổ thư',
  },
];

export function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: (typeof FEATURES)[number]) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center rounded-3xl border border-ink/10 bg-cream/50 p-8 text-center',
        'transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:bg-cream/90 hover:shadow-md'
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-white/60 transition-colors group-hover:border-ink/20">
        <Icon className="h-6 w-6 text-ink/65" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-xl text-ink font-semibold flex items-center gap-1">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink/70 min-h-[48px]">{description}</p>
      <span className="mt-6 text-xs tracking-[0.25em] font-bold text-ink/50 uppercase transition-colors group-hover:text-ink/75">
        {cta}
      </span>
    </Link>
  );
}

export function HomeFeatures() {
  return (
    <section className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.href} {...feature} />
      ))}
    </section>
  );
}
