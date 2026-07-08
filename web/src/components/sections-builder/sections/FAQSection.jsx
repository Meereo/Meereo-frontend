// sections/FAQSection.jsx
import { useState } from "react";

export function FAQSimple({ data }) {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="space-y-3">
          {data.faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className={`text-gray-400 transition-transform ${openId === faq.id ? "rotate-45" : ""}`}>+</span>
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
