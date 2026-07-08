// sections/ContactSection.jsx — Contact for BTP professionals
import Icon from "../ui/Icon";

export function ContactPro({ data }) {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-600">
              <Icon name="mail" size={20} />
            </div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</div>
            <div className="text-sm font-semibold text-gray-900">{data.email}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-600">
              <Icon name="phone" size={20} />
            </div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Téléphone</div>
            <div className="text-sm font-semibold text-gray-900">{data.phone}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-600">
              <Icon name="mapPin" size={20} />
            </div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Adresse</div>
            <div className="text-sm font-semibold text-gray-900">{data.address}</div>
          </div>
          {data.hours && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-600">
                <Icon name="clock" size={20} />
              </div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Horaires</div>
              <div className="text-sm font-semibold text-gray-900">{data.hours}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
