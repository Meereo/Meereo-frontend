// sections/PricingSection.jsx
import Icon from "../ui/Icon";

export function PricingSimple({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {data.plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl p-8 border transition-all ${plan.highlighted ? "bg-gray-900 border-gray-900 shadow-2xl scale-[1.03]" : "bg-white border-gray-100 shadow-sm"}`}>
              {plan.highlighted && <span className="inline-block bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">Most popular</span>}
              <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
              <a href="#" className={`block text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-colors ${plan.highlighted ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-700"}`}>{plan.ctaText}</a>
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 ${plan.highlighted ? "text-emerald-400" : "text-emerald-600"}`}><Icon name="check" size={14} /></span>
                    <span className={plan.highlighted ? "text-gray-300" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
