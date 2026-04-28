import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Filter,
  MoreVertical,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  subscribeAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../lib/userService";
import type { AppUser } from "../types/user";
import AdminLayout from "../components/admin/AdminLayout";
import { auth } from "../firebase/config";

type UserRole = "user" | "admin";
type UserStatus = "active" | "disabled";
type RoleFilter = "all" | "user" | "admin";
type StatusFilter = "all" | "active" | "disabled";
type VerifiedFilter = "all" | "verified" | "unverified";

/**
 * normalizeRole
 *
 * Purpose:
 * Makes sure role values are always treated safely.
 */
const normalizeRole = (role?: string): UserRole => {
  return role?.toLowerCase() === "admin" ? "admin" : "user";
};

/**
 * normalizeStatus
 *
 * Purpose:
 * Older Firestore users may not have a status field.
 * Missing status is treated as active.
 */
const normalizeStatus = (status?: string): UserStatus => {
  return status === "disabled" ? "disabled" : "active";
};

/**
 * AdminUsers page
 *
 * Purpose:
 * - show all registered users
 * - search/filter users
 * - show verification status
 * - change user roles
 * - enable/disable user accounts
 */
const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");

  /**
   * Realtime user listener.
   */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeAllUsers((usersData) => {
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalUsers = users.length;

  const adminCount = useMemo(
    () => users.filter((user) => normalizeRole(user.role) === "admin").length,
    [users]
  );

  const verifiedCount = useMemo(
    () => users.filter((user) => user.emailVerified).length,
    [users]
  );

  const disabledCount = useMemo(
    () =>
      users.filter((user) => normalizeStatus(user.status) === "disabled")
        .length,
    [users]
  );

  const activeCount = totalUsers - disabledCount;

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const role = normalizeRole(user.role);
      const status = normalizeStatus(user.status);

      const matchesSearch =
        !keyword ||
        user.displayName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.uid?.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const matchesVerified =
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" && user.emailVerified) ||
        (verifiedFilter === "unverified" && !user.emailVerified);

      return matchesSearch && matchesRole && matchesStatus && matchesVerified;
    });
  }, [users, searchTerm, roleFilter, statusFilter, verifiedFilter]);

  /**
   * handleRoleChange
   *
   * Purpose:
   * Update a user's role.
   */
  const handleRoleChange = async (uid: string, role: UserRole) => {
    const isSelf = auth.currentUser?.uid === uid;

    if (isSelf && role !== "admin") {
      alert("You cannot remove your own admin access.");
      return;
    }

    const confirmed = window.confirm(
      role === "admin"
        ? "Make this user an admin?"
        : "Change this admin back to a normal user?"
    );

    if (!confirmed) return;

    try {
      setUpdatingUid(uid);
      await updateUserRole(uid, role);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role.");
    } finally {
      setUpdatingUid(null);
    }
  };

  /**
   * handleStatusChange
   *
   * Purpose:
   * Enable or disable a user account.
   */
  const handleStatusChange = async (uid: string, nextStatus: UserStatus) => {
    const isSelf = auth.currentUser?.uid === uid;

    if (isSelf && nextStatus === "disabled") {
      alert("You cannot disable your own admin account.");
      return;
    }

    const confirmed = window.confirm(
      nextStatus === "disabled"
        ? "Disable this user account? They will no longer be able to access the compiler."
        : "Enable this user account?"
    );

    if (!confirmed) return;

    try {
      setUpdatingUid(uid);
      await updateUserStatus(uid, nextStatus);
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert("Failed to update user status.");
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage registered users, verification status, roles, and account access."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Users
              </p>
              <h3 className="text-3xl font-black text-slate-950">
                {totalUsers}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Active Users
              </p>
              <h3 className="text-3xl font-black text-slate-950">
                {activeCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Ban size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Disabled Users
              </p>
              <h3 className="text-3xl font-black text-slate-950">
                {disabledCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Admins</p>
              <h3 className="text-3xl font-black text-slate-950">
                {adminCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Directory</h3>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredUsers.length} of {users.length} registered
                users.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live Updating
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, or UID..."
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter size={18} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as RoleFilter)
                }
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter size={18} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter size={18} className="text-slate-400" />
              <select
                value={verifiedFilter}
                onChange={(event) =>
                  setVerifiedFilter(event.target.value as VerifiedFilter)
                }
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Loading users...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Verified</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Change Role</th>
                    <th className="px-6 py-4 text-right">Access</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const role = normalizeRole(user.role);
                    const status = normalizeStatus(user.status);
                    const isSelf = auth.currentUser?.uid === user.uid;
                    const isUpdating = updatingUid === user.uid;

                    return (
                      <tr
                        key={user.uid}
                        className={[
                          "border-b border-slate-100 last:border-0",
                          status === "disabled" ? "bg-red-50/30" : "",
                        ].join(" ")}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-full text-sm font-black uppercase",
                                status === "disabled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-indigo-50 text-indigo-600",
                              ].join(" ")}
                            >
                              {(user.displayName || user.email || "U")
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-950">
                                  {user.displayName || "Unnamed User"}
                                </p>

                                {isSelf && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-400">
                                ID: {user.uid.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold",
                              user.emailVerified
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600",
                            ].join(" ")}
                          >
                            {user.emailVerified ? "Verified" : "Not Verified"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold capitalize",
                              role === "admin"
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-slate-100 text-slate-600",
                            ].join(" ")}
                          >
                            {role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold capitalize",
                              status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600",
                            ].join(" ")}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={role}
                            disabled={isUpdating}
                            onChange={(event) =>
                              handleRoleChange(
                                user.uid,
                                event.target.value as UserRole
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(
                                  user.uid,
                                  status === "active" ? "disabled" : "active"
                                )
                              }
                              className={[
                                "rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                                status === "active"
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                              ].join(" ")}
                            >
                              {isUpdating
                                ? "Saving..."
                                : status === "active"
                                ? "Disable"
                                : "Enable"}
                            </button>

                            <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                              <MoreVertical size={19} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-sm font-semibold text-slate-500">
                No users matched your filters.
              </div>
            )}
          </>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminUsers;