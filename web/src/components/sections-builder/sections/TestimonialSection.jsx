// sections/TestimonialSection.jsx — Client testimonials
import Icon from "../ui/Icon";

export function TestimonialSingle({ data }) {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center gap-1 mb-6 sm:mb-8">
          {Array.from({ length: data.rating }).map((_, i) => (
            <Icon key={i} name="star" size={20} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed mb-8 sm:mb-10">
          « {data.quote} »
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          {data.avatarSrc && (
            <img src={data.avatarSrc} alt={data.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" />
          )}
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-sm sm:text-base">{data.name}</div>
            <div className="text-sm text-gray-500">{data.role}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsGrid({ data }) {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {data.testimonials.map((t) => (
            <div key={t.id} className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Icon key={i} name="star" size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">« {t.quote} »</p>
              <div className="flex items-center gap-3">
                {t.avatarSrc && (
                  <img src={t.avatarSrc} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
