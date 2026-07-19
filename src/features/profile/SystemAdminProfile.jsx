import React, { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./system-admin-profile.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4";

export default function SystemAdminProfile({ user }) {
  const { updateProfile } = useAuth();
  const { success } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "System Admin",
    email: user?.email || "admin@system",
    phone: user?.phone || "Chưa cập nhật",
    bio: user?.bio || "Quản trị viên hệ thống cấp cao. Đảm bảo sự ổn định và an toàn của toàn bộ nền tảng.",
    location: user?.location || "Chưa cập nhật",
  });

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

  const toggleEdit = () => {
    if (editing) {
      updateProfile(formData);
      success("Profile updated successfully");
    }
    setEditing(!editing);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const profileStats = [
    { value: user?.joinDate || "2024", label: "Gia nhập" },
    { value: "Admin", label: "Phân quyền" },
    { value: "Active", label: "Trạng thái" },
  ];

  const details = [
    { label: "Email", value: formData.email, field: "email", icon: Mail },
    { label: "Phone", value: formData.phone, field: "phone", icon: Activity }, // Activity as placeholder for phone
    { label: "Location", value: formData.location, field: "location", icon: MapPin },
    { label: "Role", value: user?.roles?.join(", ") || "SYSTEM_ADMIN", field: "role", icon: ShieldCheck, readonly: true },
  ];

  const activityItems = [
    {
      title: "Đăng nhập hệ thống",
      meta: "Thành công từ IP mới",
      time: "Vừa xong",
    },
    {
      title: "Cập nhật cấu hình",
      meta: "Thay đổi cài đặt bảo mật",
      time: "Hôm qua",
    },
    {
      title: "Phê duyệt quyền",
      meta: "Cấp quyền CLUB_MANAGER cho user mới",
      time: "Tuần trước",
    },
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
          >
            {editing ? <Check size={16} /> : <Pencil size={16} />}
            {editing ? "Save changes" : "Edit profile"}
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
                    style={{ background: 'transparent', color: 'white', fontSize: '31px', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #8cecf5', outline: 'none', width: '100%', marginBottom: '5px' }}
                  />
                ) : (
                  <h3 className="font-podium" style={{ textTransform: 'uppercase' }}>{formData.name}</h3>
                )}
                <p>{user?.roles?.join(", ") || "SYSTEM ADMIN"}</p>
              </div>
            </div>

            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e5ebf7', fontSize: '13px', border: '1px solid #8cecf5', borderRadius: '8px', padding: '10px', marginTop: '25px', width: '100%', maxWidth: '540px', minHeight: '80px', outline: 'none' }}
              />
            ) : (
              <p className="profile-bio">{formData.bio}</p>
            )}

            <div className="profile-actions">
              <button type="button" className="primary-action">
                System Logs
                <ArrowUpRight size={17} />
              </button>
              <button type="button" className="secondary-action">
                Settings
              </button>
            </div>

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
              <span>System status</span>
              <strong>All systems operational</strong>
              <small>Uptime: 99.99% · 0 Active Alerts</small>
            </div>

            <div className="floating-card floating-card-mini">
              <Activity size={18} />
              <div>
                <strong>100%</strong>
                <span>Health Score</span>
              </div>
            </div>

            <div className="visual-caption">
              <span>Club Management System</span>
              <strong className="font-podium">SECURE. SCALABLE. READY.</strong>
            </div>
          </div>
        </section>

        <div className="lower-grid">
          <section className="detail-panel animate-fade-up-delay-2">
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

          <section className="activity-panel animate-fade-up-delay-3">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">Latest signals</span>
                <h3>Recent activity</h3>
              </div>
              <button type="button" className="text-button">
                View all
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="activity-list">
              {activityItems.map((item, index) => (
                <article className="activity-row" key={item.title}>
                  <div className="activity-index">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                  <time>{item.time}</time>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
