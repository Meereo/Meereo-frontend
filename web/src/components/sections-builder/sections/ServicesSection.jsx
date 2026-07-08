// sections/ServicesSection.jsx — Services grid for BTP professionals
import Icon from "../ui/Icon";

export function ServicesGrid({ data }) {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {data.services.map((s) => (
            <div key={s.id} className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center mb-4 text-white">
                <Icon name={s.icon} size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
