type SectionHeaderProps = {
  eyebrow: string
  title: string
}

export function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">{title}</h2>
    </div>
  )
}
