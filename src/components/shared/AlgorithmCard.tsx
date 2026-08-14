import Link from 'next/link'
import { Eye, Play, Star } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import type { Algorithm } from '@/types/algorithm'

interface Props {
  algorithm: Algorithm
  className?: string
}

export function AlgorithmCard({ algorithm: a, className }: Props) {
  return (
    <Link
      href={`/marketplace/${a.id}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-150',
        'hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-[var(--primary)]/40',
        className,
      )}
    >
      {/* SDK 배지 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-[var(--primary-10)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary)]">
          {a.sdk}
        </span>
        {a.isRecommended && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            추천
          </span>
        )}
      </div>

      {/* 제목 */}
      <h3 className="mb-1.5 text-[14px] font-semibold leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-1">
        {a.title}
      </h3>

      {/* 설명 (2줄) */}
      <p className="mb-3 flex-1 text-[12px] leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
        {a.description}
      </p>

      {/* 평점·조회수·실행수 */}
      <div className="mb-3 flex items-center gap-3 text-[12px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-0.5">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="font-medium text-[var(--foreground)]">{a.rating.toFixed(1)}</span>
          <span>({a.ratingCount})</span>
        </span>
        <span className="flex items-center gap-0.5">
          <Eye size={11} />
          {a.viewCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-0.5">
          <Play size={11} />
          {a.runCount.toLocaleString()}
        </span>
      </div>

      {/* 카테고리 + 태그 */}
      <div className="flex flex-wrap gap-1">
        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
          {a.category}
        </span>
        {a.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
            {tag}
          </span>
        ))}
      </div>

      {/* 호버 버튼 */}
      <div className="absolute inset-0 flex items-end justify-end rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[12px] font-medium text-white shadow-md">
          상세 보기 →
        </span>
      </div>
    </Link>
  )
}
