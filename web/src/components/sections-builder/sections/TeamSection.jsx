// sections/TeamSection.jsx — Team grid for BTP professionals

export function TeamGrid({ data }) {
  return (
    <section className="bg-white py-16 px-6 sm:py-20 sm:px-8 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{data.title}</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {data.members.map((m) => (
            <div key={m.id} className="text-center group">
              <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-gray-100">
                <img
                  src={m.photoSrc}
                  alt={m.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">{m.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
