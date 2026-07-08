// sections/CTASection.jsx — Call to action for BTP professionals

export function CTADevis({ data }) {
  return (
    <section className="bg-gray-900 py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-5">
          {data.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
          {data.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <a href={data.ctaLink} className="inline-flex items-center justify-center bg-white text-gray-900 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            {data.ctaText}
          </a>
          {data.secondaryText && (
            <a href={data.secondaryLink} className="inline-flex items-center justify-center border border-gray-600 text-gray-300 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
              {data.secondaryText} →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
