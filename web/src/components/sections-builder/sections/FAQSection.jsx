// sections/FAQSection.jsx — FAQ accordion
import { useState } from "react";
import Icon from "../ui/Icon";

export function FAQSimple({ data }) {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="bg-white py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500">{data.subtitle}</p>
        </div>
        <div className="divide-y divide-gray-100">
          {data.faqs.map((faq) => (
            <div key={faq.id}>
              <button
                className="w-full flex items-center justify-between py-5 sm:py-6 text-left gap-4"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              >
                <span className="text-sm sm:text-base font-semibold text-gray-900">{faq.question}</span>
                <span className={`shrink-0 text-gray-400 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`}>
                  <Icon name="chevronDown" size={18} />
                </span>
              </button>
              {openId === faq.id && (
                <div className="pb-5 sm:pb-6 text-sm sm:text-base text-gray-500 leading-relaxed pr-8">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
