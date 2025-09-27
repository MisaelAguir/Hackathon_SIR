export default function Cards({ title }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 glass text-zinc-100">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{title}</h4>
            <button className="px-2 py-1 text-sm rounded-lg bg-white/20">Ver</button>
          </div>
          <p className="mt-3 text-sm text-white/80">Contenido de <span className="font-medium">{title}</span>. Aquí puedes renderizar datos desde tu API.</p>
        </div>
      ))}
    </div>
  )
}
