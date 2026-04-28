import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Code2,
  Database,
  Loader2,
  MonitorPlay,
  Moon,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  Terminal,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  defaultAdminSettings,
  saveAdminSettings,
  subscribeAdminSettings,
  type AdminSettingsData,
  type AdminTheme,
  type CompilerFeatureId,
} from "../lib/adminSettingsService";

export default function AdminSettings() {
  const [settings, setSettings] =
    useState<AdminSettingsData>(defaultAdminSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeAdminSettings((settingsData) => {
      setSettings(settingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = (updates: Partial<AdminSettingsData>) => {
    setSettings((current) => ({
      ...current,
      ...updates,
    }));
  };

  const toggleCompilerSetting = (id: CompilerFeatureId) => {
    setSettings((current) => ({
      ...current,
      compilerFeatures: current.compilerFeatures.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item
      ),
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await saveAdminSettings(settings);
      alert("Admin settings saved successfully.");
    } catch (error) {
      console.error("Failed to save admin settings:", error);
      alert("Failed to save admin settings.");
    } finally {
      setSaving(false);
    }
  };

  const getFeatureIcon = (id: CompilerFeatureId) => {
    if (id === "sql") return <Database size={21} />;
    if (id === "java-gui") return <MonitorPlay size={21} />;
    if (id === "html-preview") return <Terminal size={21} />;
    return <Code2 size={21} />;
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage admin preferences, compiler availability, and system-level controls."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <Settings size={14} />
            Live Settings
          </span>

          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest",
              settings.maintenanceMode
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600",
            ].join(" ")}
          >
            <span
              className={[
                "h-2 w-2 rounded-full",
                settings.maintenanceMode ? "bg-red-500" : "bg-emerald-500",
              ].join(" ")}
            />
            {settings.maintenanceMode ? "Maintenance On" : "System Active"}
          </span>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Loading admin settings...
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Compiler Features
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enable or disable major compiler features for users.
                  </p>
                </div>

                <Code2 className="text-indigo-600" size={24} />
              </div>

              <div className="mt-6 space-y-4">
                {settings.compilerFeatures.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-4">
                      <div
                        className={[
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                          item.enabled
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-slate-200 text-slate-500",
                        ].join(" ")}
                      >
                        {getFeatureIcon(item.id)}
                      </div>

                      <div>
                        <h4 className="font-black text-slate-950">
                          {item.label}
                        </h4>
                        <p className="mt-1 max-w-xl text-sm text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCompilerSetting(item.id)}
                      className={[
                        "relative h-8 w-14 rounded-full transition",
                        item.enabled ? "bg-indigo-600" : "bg-slate-300",
                      ].join(" ")}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span
                        className={[
                          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                          item.enabled ? "left-7" : "left-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      Admin Preferences
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Customize how the admin portal behaves.
                    </p>
                  </div>

                  <ShieldCheck className="text-indigo-600" size={24} />
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Admin Theme
                    </label>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { value: "system", label: "System", icon: Settings },
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                      ].map((option) => {
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              updateSettings({
                                theme: option.value as AdminTheme,
                              })
                            }
                            className={[
                              "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-bold transition",
                              settings.theme === option.value
                                ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <Icon size={18} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Max Runs Per User / Day
                    </label>
                    <input
                      value={settings.maxRunLimit}
                      onChange={(event) =>
                        updateSettings({
                          maxRunLimit: Number(event.target.value),
                        })
                      }
                      type="number"
                      min="1"
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Max Files Per User
                    </label>
                    <input
                      value={settings.maxFilesPerUser}
                      onChange={(event) =>
                        updateSettings({
                          maxFilesPerUser: Number(event.target.value),
                        })
                      }
                      type="number"
                      min="1"
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertTriangle size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-red-600">
                      Danger Zone
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      These controls can affect user access and system availability.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex flex-col gap-4 rounded-2xl bg-red-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-black text-slate-950">
                        Maintenance Mode
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Temporarily block users from using compiler features.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        updateSettings({
                          maintenanceMode: !settings.maintenanceMode,
                        })
                      }
                      className={[
                        "rounded-xl px-4 py-2 text-sm font-bold transition",
                        settings.maintenanceMode
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-red-600 text-white hover:bg-red-700",
                      ].join(" ")}
                    >
                      {settings.maintenanceMode ? "Turn Off" : "Turn On"}
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      alert(
                        "Later we can connect this to clear inactive Java GUI sessions."
                      )
                    }
                    className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Clear Inactive GUI Sessions
                  </button>
                </div>
              </section>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">
              Current Settings Summary
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Quick overview of selected admin settings from Firestore.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Maintenance
                </p>
                <p
                  className={[
                    "mt-2 text-2xl font-black",
                    settings.maintenanceMode
                      ? "text-red-600"
                      : "text-emerald-600",
                  ].join(" ")}
                >
                  {settings.maintenanceMode ? "On" : "Off"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">Theme</p>
                <p className="mt-2 text-2xl font-black capitalize text-slate-950">
                  {settings.theme}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Run Limit
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {settings.maxRunLimit}/day
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  File Limit
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {settings.maxFilesPerUser}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}