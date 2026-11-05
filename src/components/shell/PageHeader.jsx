export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-display text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">{title}</h1>
        {description && <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}