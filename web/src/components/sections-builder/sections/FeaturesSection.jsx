// sections/FeaturesSection.jsx
import Icon from "../ui/Icon";

export function FeaturesGrid({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.features.map((f) => (
            <div key={f.id} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                <Icon name={f.icon} size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesAlternating({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="space-y-24">
          {data.features.map((f, i) => (
            <div key={f.id} className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-lg text-gray-500 leading-relaxed">{f.description}</p>
              </div>
              <div className="flex-1">
                <img src={f.imageSrc} alt={f.title} className="w-full h-64 object-cover rounded-2xl shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
