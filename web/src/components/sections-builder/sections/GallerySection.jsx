// sections/GallerySection.jsx

export function GalleryGrid({ data }) {
  return (
    <section className="bg-white py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-500">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.images.map((img) => (
            <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-square">
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
