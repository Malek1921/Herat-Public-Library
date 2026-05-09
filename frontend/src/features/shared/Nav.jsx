import { NavLink } from "react-router";

function Nav() {
  const baseStyle = "block px-4 py-3.5 text-sm font-medium transition-colors";

  return (
    <nav className="flex flex-col space-y-1">
      <NavLink
        to="/requests"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Requests
      </NavLink>
      <NavLink
        end
        to="/"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/books"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Books
      </NavLink>

      <NavLink
        to="/authors"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Authors
      </NavLink>

      <NavLink
        to="/publishers"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Publishers
      </NavLink>

      <NavLink
        to="/subjects"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Subjects
      </NavLink>

      <NavLink
        to="/translators"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Translators
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          `${baseStyle} ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`
        }
      >
        Users
      </NavLink>
    </nav>
  );
}

export default Nav;
