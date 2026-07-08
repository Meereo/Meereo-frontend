// sections/PortfolioSection.jsx — Project showcase for BTP professionals

export function PortfolioGrid({ data }) {
  return (
    <section className="bg-white py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {data.projects.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-white font-semibold text-base mb-1">{p.title}</h3>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>{p.location}</span>
                  {p.year && <><span className="text-white/40">·</span><span>{p.year}</span></>}
                </div>
              </div>
              {/* Always visible on mobile (no hover) */}
              <div className="sm:hidden p-4 bg-white">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500">{p.location} {p.year && `· ${p.year}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
