import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
 
      <div className="relative w-80">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-gray-600 hover:text-black">
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
            A
          </div>

          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}