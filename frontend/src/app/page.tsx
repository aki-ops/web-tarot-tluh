import { HomeFeatures } from '@/components/home/FeatureCard';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-16 px-4 py-16">
      <section className="max-w-2xl text-center">
        <p className="mb-4 text-xs md:text-sm tracking-[0.4em] font-semibold text-ink/40 uppercase">TLUH TAROT</p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl font-normal">
          Khám Phá Thông Điệp Ẩn Giấu
        </h1>
        <p className="mt-5 text-sm md:text-base leading-relaxed text-ink/70">
          Mỗi lá bài là một góc nhìn chiêm nghiệm. Hãy nhắm mắt tĩnh tâm, đặt câu hỏi — và để những biểu tượng cổ xưa dẫn lối cho bạn.
        </p>
      </section>

      <HomeFeatures />
    </div>
  );
}
