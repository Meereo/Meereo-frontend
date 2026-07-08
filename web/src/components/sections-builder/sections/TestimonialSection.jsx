// sections/TestimonialSection.jsx

export function TestimonialSingle({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex gap-0.5 justify-center mb-4">
          {Array.from({ length: data.rating }).map((_, i) => <span key={i} className="text-amber-400">★</span>)}
        </div>
        <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 leading-snug mb-8">"{data.quote}"</blockquote>
        <div className="flex items-center justify-center gap-4">
          <img src={data.avatarSrc} alt={data.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
          <div className="text-left">
            <p className="font-semibold text-gray-900">{data.name}</p>
            <p className="text-sm text-gray-500">{data.role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsGrid({ data }) {
  return (
    <section className="bg-gray-50 py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatarSrc} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
