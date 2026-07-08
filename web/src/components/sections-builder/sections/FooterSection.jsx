// sections/FooterSection.jsx

export function FooterSimple({ data }) {
  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 mb-12">
          <div className="lg:w-1/3">
            <h3 className="text-white text-xl font-bold mb-2">{data.logo}</h3>
            <p className="text-sm">{data.tagline}</p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {data.columns.map((col) => (
              <div key={col.id}>
                <h4 className="text-white text-sm font-semibold mb-4">{col.heading}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.id}><a href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm">{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
