import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("alejoUser") || "null"
    );

    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);

    setForm({
      fullName: savedUser.fullName || "",
      email: savedUser.email || "",
      phone: savedUser.phone || "",
    });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    const updatedUser = {
      ...user,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };

    localStorage.setItem(
      "alejoUser",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    setMessage("Profile updated successfully.");
  };

  const handleLogout = () => {
    localStorage.removeItem("alejoUser");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">

      <div className="profile-header">
        <div>
          <p className="profile-label">
            ALEJO LOGISTICS
          </p>

          <h1>My Profile</h1>

          <p>
            Manage your account information and
            contact details.
          </p>
        </div>
      </div>


      <div className="profile-layout">

        {/* ACCOUNT SUMMARY */}

        <div className="profile-summary">

          <div className="profile-avatar">
            {form.fullName
              ? form.fullName.charAt(0).toUpperCase()
              : "C"}
          </div>

          <h2>
            {form.fullName || "Customer"}
          </h2>

          <p>
            {form.email}
          </p>

          <span className="account-badge">
            Customer Account
          </span>

          <div className="summary-divider"></div>

          <div className="account-detail">
            <span>Account Type</span>
            <strong>Customer</strong>
          </div>

          <div className="account-detail">
            <span>Phone</span>
            <strong>
              {form.phone || "Not provided"}
            </strong>
          </div>

        </div>


        {/* EDIT PROFILE */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div>
              <p className="profile-label">
                ACCOUNT SETTINGS
              </p>

              <h2>Personal Information</h2>
            </div>

          </div>


          {message && (
            <div
              className={
                message.includes("successfully")
                  ? "profile-success"
                  : "profile-error"
              }
            >
              {message}
            </div>
          )}


          <form onSubmit={handleSave}>

            <div className="profile-form-group">

              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
              />

            </div>


            <div className="profile-form-group">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />

            </div>


            <div className="profile-form-group">

              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08012345678"
              />

            </div>


            <div className="profile-actions">

              <button
                type="submit"
                className="save-profile"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="logout-profile"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Profile;