// sections/StatsSection.jsx — Key metrics for BTP professionals

export function StatsBar({ data }) {
  return (
    <section className="bg-gray-900 py-14 px-6 sm:py-16 sm:px-8 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <h2 className="text-center text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-10 sm:mb-14">
            {data.title}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {data.stats.map((s) => (
            <div key={s.id} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
                {s.value}
              </div>
              <div className="text-sm sm:text-base text-gray-400 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
