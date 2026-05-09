import ProjectRoutes from "./features/routes/ProjectRoutes";
import { BrowserRouter } from "react-router";
import Layout from "./features/layout/Layout";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen flex bg-gray-100">
          {/* Sidebar */}
          <aside className="h-screen w-64 bg-white border-r shadow-sm ">
            <Layout />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <ProjectRoutes />
          </main>
        </div>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
