// sections/HeroSection.jsx — Hero for BTP professionals

export function HeroPro({ data }) {
  return (
    <section className="bg-white py-16 px-6 sm:py-20 sm:px-8 lg:py-28">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 min-w-0 text-center lg:text-left">
          {data.badge && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4 sm:mb-6">
              {data.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-3 sm:mb-4">
            {data.companyName}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-700 mb-4 sm:mb-5">
            {data.tagline}
          </p>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
            {data.description}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
            <a href={data.ctaLink} className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
              {data.ctaText}
            </a>
            {data.secondaryText && (
              <a href={data.secondaryLink} className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                {data.secondaryText} →
              </a>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 w-full">
          <img
            src={data.imageSrc}
            alt={data.imageAlt}
            className="w-full h-56 sm:h-72 lg:h-[420px] object-cover rounded-2xl lg:rounded-3xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

export function HeroCentered({ data }) {
  return (
    <section className="bg-white py-16 px-6 sm:py-20 sm:px-8 lg:py-28 text-center">
      <div className="max-w-3xl mx-auto">
        {data.badge && (
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4 sm:mb-6">
            {data.badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-3 sm:mb-4">
          {data.companyName}
        </h1>
        <p className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4">
          {data.tagline}
        </p>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6 sm:mb-8">
          {data.description}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-10 sm:mb-14">
          <a href={data.ctaLink} className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
            {data.ctaText}
          </a>
          {data.secondaryText && (
            <a href={data.secondaryLink} className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              {data.secondaryText} →
            </a>
          )}
        </div>
        <img
          src={data.imageSrc}
          alt={data.imageAlt}
          className="w-full h-56 sm:h-72 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-xl border border-gray-100"
        />
      </div>
    </section>
  );
}
