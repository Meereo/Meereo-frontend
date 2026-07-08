// sections/CTASection.jsx

export function CTADark({ data }) {
  return (
    <section className="bg-gray-950 py-24 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">{data.title}</h2>
        <p className="text-xl text-gray-400 mb-10">{data.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={data.ctaLink} className="inline-flex items-center bg-white text-gray-900 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">{data.ctaText}</a>
          {data.secondaryText && (
            <a href={data.secondaryLink} className="inline-flex items-center border border-gray-700 text-gray-300 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors">{data.secondaryText}</a>
          )}
        </div>
      </div>
    </section>
  );
}

export function CTALight({ data }) {
  return (
    <section className="bg-gray-50 py-24 px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
        <p className="text-xl text-gray-500 mb-8">{data.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={data.ctaLink} className="inline-flex items-center bg-gray-900 text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">{data.ctaText}</a>
          {data.secondaryText && (
            <a href={data.secondaryLink} className="inline-flex items-center border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">{data.secondaryText}</a>
          )}
        </div>
      </div>
    </section>
  );
}
