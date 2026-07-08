// sections/HeroSection.jsx — Renders both hero-split and hero-centered

export function HeroSplit({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 min-w-0">
          {data.badge && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              {data.badge}
            </span>
          )}
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">{data.title}</h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">{data.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <a href={data.ctaLink} className="inline-flex items-center bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">{data.ctaText}</a>
            {data.secondaryText && (
              <a href={data.secondaryLink} className="inline-flex items-center border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">{data.secondaryText} →</a>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent rounded-3xl" />
            <img src={data.imageSrc} alt={data.imageAlt} className="relative w-full h-80 lg:h-[480px] object-cover rounded-3xl shadow-2xl shadow-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCentered({ data }) {
  return (
    <section className="bg-white py-28 px-8 text-center">
      <div className="max-w-3xl mx-auto">
        {data.badge && (
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">{data.badge}</span>
        )}
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">{data.title}</h1>
        <p className="text-xl text-gray-500 leading-relaxed mb-8">{data.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <a href={data.ctaLink} className="inline-flex items-center bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">{data.ctaText}</a>
          {data.secondaryText && (
            <a href={data.secondaryLink} className="inline-flex items-center border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">{data.secondaryText} →</a>
          )}
        </div>
        <img src={data.imageSrc} alt={data.imageAlt} className="w-full h-80 object-cover rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100" />
      </div>
    </section>
  );
}
