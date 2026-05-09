import Nav from "../shared/Nav";

function Layout() {
  return (
    <div className="min-h-screen w-64 bg-white flex flex-col justify-between border-r shadow-sm">
      {/* Top: Library Name + Nav */}
      <div className=" pt-6">
        <h3 className="text-2xl px-3 font-bold mb-6 text-slate-900">
          Herat Public Library
        </h3>
        <Nav />
      </div>

      {/* Bottom: Profile Section */}
      <div className="border-t mt-6 px-3 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Name Lastname
            </h2>
            <p className="text-sm text-gray-500">Librarian</p>
          </div>
          <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Layout;
