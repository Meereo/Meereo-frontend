// sections/ContactSection.jsx

export function ContactSimple({ data }) {
  return (
    <section className="bg-gray-50 py-24 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
        <p className="text-xl text-gray-500 mb-12">{data.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-400 mb-1">Email</p>
            <p className="font-medium text-gray-900">{data.email}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-400 mb-1">Phone</p>
            <p className="font-medium text-gray-900">{data.phone}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-400 mb-1">Address</p>
            <p className="font-medium text-gray-900">{data.address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
