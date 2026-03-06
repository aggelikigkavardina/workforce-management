import { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/EmployeeService";
import { changeMyPassword } from "../services/UserService";
import { isAdminUser } from "../services/AuthService";
import { isValidPassword } from "../helpers/ValidationHelper";
import { Eye, EyeOff } from "lucide-react";

const MyProfileComponent = () => {
  const admin = isAdminUser();

  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // editable fields (same for admin & employee)
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // change password fields (optional)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saveMsg, setSaveMsg] = useState(null);

  const [errors, setErrors] = useState({
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    general: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // snapshot when entering edit mode
  const initialRef = useRef(null);

  const resetErrors = () =>
    setErrors({
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      general: "",
    });

  const fillFromEmployee = (data) => {
    setEmployee(data);
    setPhone(data.phone || "");
    setAddress(data.address || "");
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => fillFromEmployee(res.data))
      .catch((err) => {
        console.error(err);
        setErrors((prev) => ({
          ...prev,
          general: "Access denied or session expired. Please login again.",
        }));
      });
  }, []);

  // auto-hide success message after 3s
  useEffect(() => {
    if (!saveMsg) return;
    const t = setTimeout(() => setSaveMsg(null), 3000);
    return () => clearTimeout(t);
  }, [saveMsg]);

  const norm = (v) => (v ?? "").trim();

  const wantsPasswordChange =
    norm(currentPassword) !== "" || norm(newPassword) !== "";

  const isProfileDirty = (() => {
    const init = initialRef.current;
    if (!init) return false;

    return norm(phone) !== norm(init.phone) || norm(address) !== norm(init.address);
  })();

  const isDirty = isProfileDirty || wantsPasswordChange;

  const validate = () => {
    const e = {
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      general: "",
    };

    let ok = true;

    if (phone.trim() && !/^69\d{8}$/.test(phone.trim())) {
      e.phone = "Phone must be in format 69XXXXXXXX";
      ok = false;
    }

    if (address.trim().length > 255) {
      e.address = "Address must be <= 255 characters";
      ok = false;
    }

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) {
        e.currentPassword = "Current password is required";
        ok = false;
      }
      if (!newPassword.trim()) {
        e.newPassword = "New password is required";
        ok = false;
      } else if (!isValidPassword(newPassword.trim())) {
        e.newPassword = "Password must be 6-64 characters";
        ok = false;
      }
    }

    setErrors(e);
    return ok;
  };

  const enterEditMode = () => {
    setSaveMsg(null);
    resetErrors();
    initialRef.current = { phone, address };
    setEditMode(true);
  };

  const handleCancel = () => {
    setSaveMsg(null);
    resetErrors();

    if (employee) {
      setPhone(employee.phone || "");
      setAddress(employee.address || "");
    }

    setCurrentPassword("");
    setNewPassword("");
    setEditMode(false);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaveMsg(null);
    resetErrors();

    if (!isDirty) return;
    if (!validate()) return;

    try {
      const payload = {
        phone: phone.trim() === "" ? null : phone.trim(),
        address: address.trim() === "" ? null : address.trim(),
      };

      const updated = await updateMyProfile(payload);
      fillFromEmployee(updated.data);

      if (wantsPasswordChange) {
        await changeMyPassword(currentPassword.trim(), newPassword.trim());
        setCurrentPassword("");
        setNewPassword("");
      }

      setSaveMsg(
        wantsPasswordChange ? "Profile updated & password changed" : "Profile updated"
      );

      setEditMode(false);
      initialRef.current = null;
    } catch (err) {
      const data = err?.response?.data;
      const fieldErrors = data?.fieldErrors;

      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data?.message || "Something went wrong",
        }));
      }

      console.log("PROFILE SAVE ERROR:", {
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
  };

  if (!employee) {
    return (
      <div className="container mt-3">
        {errors.general ? (
          <div className="alert alert-danger">{errors.general}</div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body">
              <h3 className="card-title mb-1 text-start">My Profile</h3>
              <div className="text-muted text-start">{admin ? "Admin" : "Employee"}</div>

              <hr />

              {!editMode ? (
                <>
                  <div className="mb-2">
                    <strong>First Name:</strong> {employee.firstName}
                  </div>
                  <div className="mb-2">
                    <strong>Last Name:</strong> {employee.lastName}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {employee.email}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {employee.phone || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> {employee.address || "-"}
                  </div>

                  {saveMsg && (
                    <div className="alert alert-success mt-3 mb-0">{saveMsg}</div>
                  )}
                </>
              ) : (
                <form onSubmit={handleSave}>
                  {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                  <div className="form-group mb-2">
                    <label>Phone:</label>
                    <input
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="69XXXXXXXX"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label>Address:</label>
                    <input
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City"
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  <hr />
                  <h5 className="mb-2">Change Password</h5>

                  <div className="form-group mb-2">
                    <label>Current Password:</label>

                    <div className="input-group">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                      />

                      <span
                        className="input-group-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowCurrentPassword((p) => !p)}
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    </div>

                    {errors.currentPassword && (
                      <div className="invalid-feedback d-block">{errors.currentPassword}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label>New Password:</label>

                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />

                      <span
                        className="input-group-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowNewPassword((p) => !p)}
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    </div>

                    {errors.newPassword && (
                      <div className="invalid-feedback d-block">{errors.newPassword}</div>
                    )}
                  </div>

                  {saveMsg && <div className="alert alert-success mt-2">{saveMsg}</div>}

                  <div className="d-flex justify-content-between mt-3">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={!isDirty}>
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!editMode && (
              <div className="card-footer bg-white border-0">
                <div className="d-flex justify-content-end">
                  <button className="btn btn-primary" onClick={enterEditMode}>
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileComponent;