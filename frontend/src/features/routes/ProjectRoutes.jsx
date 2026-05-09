import { Routes, Route } from "react-router";
import Dashboard from "../dashboard/Dashboard";
import Users from "../users/Users";
import Books from "../books/Books";
import Authors from "../authors/Authors";
import Subjects from "../subjects/Subjects";
import Translators from "../translators/Translators";
import Publishers from "../publishers/Publishers";
import Login from "../auth/Login";
import UserProfile from "../auth/UserProfile";
import Requests from "../requests/Requests";

function ProjectRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/books" element={<Books />} />
      <Route path="/authors" element={<Authors />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/translators" element={<Translators />} />
      <Route path="/publishers" element={<Publishers />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/requests" element={<Requests />} />
    </Routes>
  );
}

export default ProjectRoutes;
