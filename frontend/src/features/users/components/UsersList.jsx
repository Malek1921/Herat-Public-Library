// frontend/src/features/users/components/UsersList.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const UsersList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const setEditing = useEdit((s) => s.setEditing);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch {
      toast.error('خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user) => {
    setEditing(user, 'user');
    onEdit();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'مدیر';
      case 'staff': return 'کارمند';
      default: return role;
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-right px-6 py-3">نام کاربری</th>
                <th className="text-right px-6 py-3">ایمیل</th>
                <th className="text-right px-6 py-3">نقش</th>
                <th className="text-right px-6 py-3">فعال</th>
                <th className="text-right px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">در حال بارگذاری...</td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">کاربری یافت نشد.</td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{u.username}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-gray-600">{getRoleLabel(u.role)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'بله' : 'خیر'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline ml-3">ویرایش</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;