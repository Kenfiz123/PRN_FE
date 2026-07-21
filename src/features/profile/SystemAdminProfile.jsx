import React, { useEffect, useState } from "react";
import {
  Check,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import "./system-admin-profile.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatRole } from "../../auth/permissions";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4";

export default function SystemAdminProfile({ user }) {
  const { api, updateProfile } = useAuth();
  const { success, error } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "System Admin",
    email: user?.email || "admin@system",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "System Admin",
      email: user?.email || "admin@system",
    });
  }, [user?.email, user?.name]);

  const handleTilt = (event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    target.style.setProperty("--rotate-x", `${(0.5 - y) * 7}deg`);
    target.style.setProperty("--rotate-y", `${(x - 0.5) * 9}deg`);
    target.style.setProperty("--mouse-x", `${x * 100}%`);
    target.style.setProperty("--mouse-y", `${y * 100}%`);
  };

  const resetTilt = (event) => {
    const target = event.currentTarget;
    target.style.setProperty("--rotate-x", "0deg");
    target.style.setProperty("--rotate-y", "0deg");
    target.style.setProperty("--mouse-x", "50%");
    target.style.setProperty("--mouse-y", "50%");
  };

  const toggleEdit = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }

    const fullName = formData.name.trim();
    const emailAddress = formData.email.trim();
    if (!fullName || !emailAddress) {
      error("Full name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateUser(user.id, {
        fullName,
        email: emailAddress,
        isActive: user.isActive,
        roles: user.roles,
      });
      updateProfile({
        name: updated.fullName,
        email: updated.email,
        roles: updated.roles,
        isActive: updated.isActive,
        isLocked: updated.isLocked,
      });
      setEditing(false);
      success("Profile updated successfully.");
    } catch (requestError) {
      error(requestError.message || "Unable to update the profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const profileStats = [
    { value: user?.username || "—", label: "Username" },
    { value: "Technical Admin", label: "Role" },
    { value: user?.isActive && !user?.isLocked ? "Active" : "Restricted", label: "Status" },
  ];

  const details = [
    { label: "Email", value: formData.email, field: "email", icon: Mail },
    { label: "Username", value: user?.username || "—", icon: UserRound, readonly: true },
    { label: "Role", value: user?.roles?.map(formatRole).join(", ") || "System administrator", icon: ShieldCheck, readonly: true },
    { label: "Status", value: user?.isActive && !user?.isLocked ? "Active" : "Restricted", icon: Check, readonly: true },
  ];

  return (
    <div className="system-admin-profile">
      <div className="content">
        <div className="content-head animate-fade-up">
          <div>
            <span className="eyebrow">
              <Sparkles size={14} />
              Personal workspace
            </span>
            <h2 className="font-podium">CREATIVE PROFILE</h2>
            <p>
              A focused view of your identity, active work, and system presence.
            </p>
          </div>

          <button
            type="button"
            className={`edit-button ${editing ? "is-editing" : ""}`}
            onClick={toggleEdit}
            disabled={saving}
          >
            {editing ? <Check size={16} /> : <Pencil size={16} />}
            {saving ? "Saving..." : editing ? "Save changes" : "Edit profile"}
          </button>
        </div>

        <section
          className="profile-stage animate-fade-up-delay-1"
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          <div className="stage-copy">
            <div className="profile-id">
              <div className="avatar-shell">
                <div className="avatar-glow" />
                <div className="avatar-main">{user?.avatar || "SA"}</div>
                <span className="online-mark">
                  <Check size={13} />
                </span>
              </div>

              <div>
                <span className="profile-handle">@{user?.username || "admin"}</span>
                {editing ? (
                  <input 
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={saving}
                    aria-label="Full name"
                    style={{ background: 'transparent', color: 'white', fontSize: '31px', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #8cecf5', outline: 'none', width: '100%', marginBottom: '5px' }}
                  />
                ) : (
                  <h3 className="font-podium" style={{ textTransform: 'uppercase' }}>{formData.name}</h3>
                )}
                <p>{user?.roles?.map(formatRole).join(", ") || "System administrator"}</p>
              </div>
            </div>

            <p className="profile-bio">
              Technical administrator responsible for platform access, account administration, stability, and security.
            </p>

            <div className="profile-stats">
              {profileStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stage-visual">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              src={VIDEO_URL}
            />

            <div className="visual-shade" />
            <div className="visual-grid" />
            <div className="visual-scanline" />

            <div className="visual-topline">
              <span>VANGUARD / ADMIN 01</span>
              <span className="live-pill">
                <i />
                Live
              </span>
            </div>

            <div className="floating-card floating-card-main">
              <span>Authenticated account</span>
              <strong>{user?.username || "systemadmin@club.local"}</strong>
              <small>Role-based access is enabled</small>
            </div>

            <div className="floating-card floating-card-mini">
              <ShieldCheck size={18} />
              <div>
                <strong>{user?.isActive && !user?.isLocked ? "Active" : "Restricted"}</strong>
                <span>Account status</span>
              </div>
            </div>

            <div className="visual-caption">
              <span>Club Management System</span>
              <strong className="font-podium">SECURE. SCALABLE. READY.</strong>
            </div>
          </div>
        </section>

        <div className="lower-grid">
          <section className="detail-panel animate-fade-up-delay-2" style={{ gridColumn: "1 / -1" }}>
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">Identity details</span>
                <h3>Profile information</h3>
              </div>
              <ShieldCheck size={20} />
            </div>

            <div className="detail-grid">
              {details.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="detail-item" key={item.label}>
                    <div className="detail-icon">
                      <Icon size={17} />
                    </div>
                    <div>
                      <span>{item.label}</span>
                      {editing && !item.readonly ? (
                        <input
                          value={item.value}
                          onChange={(e) => handleChange(item.field, e.target.value)}
                          aria-label={item.label}
                          disabled={saving}
                        />
                      ) : (
                        <strong>{item.value}</strong>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
