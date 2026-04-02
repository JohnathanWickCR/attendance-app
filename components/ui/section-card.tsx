type SectionCardProps = {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border bg-white p-4 shadow-sm md:p-5 ${className ?? ""}`}
    >
      {(title || description) && (
        <div className="mb-4">
          {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}

      {children}
    </section>
  )
}