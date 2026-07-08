// sections/FooterSection.jsx — Footer for BTP professionals
import Icon from "../ui/Icon";

export function FooterPro({ data }) {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 px-6 sm:py-14 sm:px-8 lg:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-12 mb-10 sm:mb-12">
          <div className="flex-1">
            <div className="text-lg sm:text-xl font-bold text-white mb-2">{data.companyName}</div>
            <p className="text-sm leading-relaxed max-w-xs">{data.tagline}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            {data.email && (
              <div className="flex items-center gap-3">
                <Icon name="mail" size={15} className="text-gray-500" />
                <span>{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-3">
                <Icon name="phone" size={15} className="text-gray-500" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.address && (
              <div className="flex items-center gap-3">
                <Icon name="mapPin" size={15} className="text-gray-500" />
                <span>{data.address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-center text-gray-500">{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
