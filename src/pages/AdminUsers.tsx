import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../lib/userService";
import type { AppUser } from "../types/user";

/**
 * AdminUsers page
 *
 * Purpose:
 * - show all registered users
 * - show their verification status
 * - allow an admin to change roles
 */
const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * loadUsers
   * Fetch all Firestore user documents for admin management.
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * handleRoleChange
   * Update a user's role, then refresh the table.
   */
  const handleRoleChange = async (
    uid: string,
    role: "user" | "admin"
  ) => {
    try {
      await updateUserRole(uid, role);
      await loadUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading users...</div>;
  }

  return (
    <div className="min-h-screen bg-[#140406] p-6 text-white">
      <div className="mx-auto max-w-6xl rounded-2xl border border-red-900/40 bg-[#221013]/90 p-6">
        <h1 className="mb-4 text-2xl font-bold">Admin - User Management</h1>

        <div className="overflow-x-auto">
          <table className="w-full border border-red-900/30">
            <thead>
              <tr className="bg-[#16090b]">
                <th className="border border-red-900/30 p-3 text-left">Name</th>
                <th className="border border-red-900/30 p-3 text-left">Email</th>
                <th className="border border-red-900/30 p-3 text-left">Verified</th>
                <th className="border border-red-900/30 p-3 text-left">Role</th>
                <th className="border border-red-900/30 p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="border border-red-900/30 p-3">
                    {user.displayName}
                  </td>
                  <td className="border border-red-900/30 p-3">
                    {user.email}
                  </td>
                  <td className="border border-red-900/30 p-3">
                    {user.emailVerified ? "Yes" : "No"}
                  </td>
                  <td className="border border-red-900/30 p-3">
                    {user.role}
                  </td>
                  <td className="border border-red-900/30 p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.uid,
                          e.target.value as "user" | "admin"
                        )
                      }
                      className="rounded border border-red-900/40 bg-[#16090b] px-2 py-1 text-white"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-6 text-center text-gray-400">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;