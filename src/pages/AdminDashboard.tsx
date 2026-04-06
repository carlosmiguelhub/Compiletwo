import { Link } from "react-router-dom";

/**
 * AdminDashboard
 *
 * Purpose:
 * Main dashboard for admin users.
 */
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#140406] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-pink-400">
          Admin Dashboard
        </h1>
        <p className="mb-8 text-gray-400">
          Manage users and monitor the app from here.
        </p>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-red-900/40 bg-[#221013]/90 p-6">
            <h2 className="text-sm text-gray-400">Users</h2>
            <p className="mt-2 text-2xl font-bold">Manage Accounts</p>
          </div>

          <div className="rounded-2xl border border-red-900/40 bg-[#221013]/90 p-6">
            <h2 className="text-sm text-gray-400">Roles</h2>
            <p className="mt-2 text-2xl font-bold">Admin Controls</p>
          </div>

          <div className="rounded-2xl border border-red-900/40 bg-[#221013]/90 p-6">
            <h2 className="text-sm text-gray-400">Verification</h2>
            <p className="mt-2 text-2xl font-bold">User Status</p>
          </div>

          <div className="rounded-2xl border border-red-900/40 bg-[#221013]/90 p-6">
            <h2 className="text-sm text-gray-400">Tools</h2>
            <p className="mt-2 text-2xl font-bold">System Access</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/admin/users"
            className="inline-flex rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white hover:opacity-90"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}