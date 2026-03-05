import { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/EmployeeService";
import { changeMyPassword } from "../services/UserService";
import { isAdminUser } from "../services/AuthService";
import { isValidEmail, isValidPassword } from "../helpers/ValidationHelper";
import { Eye, EyeOff } from "lucide-react";

const MyProfileComponent = () => {
  const admin = isAdminUser();

  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // change password fields (optional)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saveMsg, setSaveMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    general: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // snapshot of initial values when entering edit mode
  const initialRef = useRef(null);

  const resetErrors = () =>
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      general: "",
    });

  const fillFromEmployee = (data) => {
    setEmployee(data);
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        fillFromEmployee(res.data);
      })
      .catch((err) => {
        console.error(err);
        setErrors((prev) => ({
          ...prev,
          general: "Access denied or session expired. Please login again.",
        }));
      });
  }, []);

  const norm = (v) => (v ?? "").trim();

  const wantsPasswordChange =
    norm(currentPassword) !== "" || norm(newPassword) !== "";

  const isProfileDirty = (() => {
    const init = initialRef.current;
    if (!init) return false;

    if (admin) {
      return (
        norm(firstName) !== norm(init.firstName) ||
        norm(lastName) !== norm(init.lastName) ||
        norm(email) !== norm(init.email) ||
        norm(phone) !== norm(init.phone) ||
        norm(address) !== norm(init.address)
      );
    }

    return norm(phone) !== norm(init.phone) || norm(address) !== norm(init.address);
  })();

  const isDirty = isProfileDirty || wantsPasswordChange;

  const validate = () => {
    const e = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      general: "",
    };

    let ok = true;

    // admin can edit identity fields
    if (admin) {
      if (!firstName.trim()) {
        e.firstName = "First name is required";
        ok = false;
      } else if (firstName.trim().length > 50) {
        e.firstName = "Max 50 characters";
        ok = false;
      }

      if (!lastName.trim()) {
        e.lastName = "Last name is required";
        ok = false;
      } else if (lastName.trim().length > 50) {
        e.lastName = "Max 50 characters";
        ok = false;
      }

      if (!email.trim()) {
        e.email = "Email is required";
        ok = false;
      } else if (!isValidEmail(email.trim())) {
        e.email = "Invalid email format";
        ok = false;
      } else if (email.trim().length > 120) {
        e.email = "Max 120 characters";
        ok = false;
      }
    }

    // phone/address for both
    if (phone.trim() && !/^69\d{8}$/.test(phone.trim())) {
      e.phone = "Phone must be in format 69XXXXXXXX";
      ok = false;
    }
    if (address.trim().length > 255) {
      e.address = "Address must be <= 255 characters";
      ok = false;
    }

    // change password optional, but must be consistent
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

  const handleCancel = () => {
    setSaveMsg(null);
    setInfoMsg(null);
    resetErrors();

    if (employee) {
      setFirstName(employee.firstName || "");
      setLastName(employee.lastName || "");
      setEmail(employee.email || "");
      setPhone(employee.phone || "");
      setAddress(employee.address || "");
    }

    setCurrentPassword("");
    setNewPassword("");
    setEditMode(false);
  };

  const enterEditMode = () => {
    setSaveMsg(null);
    setInfoMsg(null);
    resetErrors();

    initialRef.current = {
      firstName,
      lastName,
      email,
      phone,
      address,
    };

    setEditMode(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaveMsg(null);
    setInfoMsg(null);
    resetErrors();

    // Block save if nothing changed
    if (!isDirty) {
      setInfoMsg("No changes to save. Click Cancel.");
      return;
    }

    if (!validate()) return;

    try {
      const profilePayload = admin
        ? {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim() === "" ? null : phone.trim(),
            address: address.trim() === "" ? null : address.trim(),
          }
        : {
            phone: phone.trim() === "" ? null : phone.trim(),
            address: address.trim() === "" ? null : address.trim(),
          };

      const updated = await updateMyProfile(profilePayload);
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

  const clearInfo = () => setInfoMsg(null);

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-8 col-lg-6 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="position-relative">
                  <div className="text-center">
                    <h3 className="card-title mb-1">My Profile</h3>
                    <div className="text-muted">{admin ? "Admin" : "Employee"}</div>
                  </div>
                </div>
              </div>

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

                  {saveMsg && <div className="alert alert-success mt-3 mb-0">{saveMsg}</div>}
                </>
              ) : (
                <form onSubmit={handleSave}>
                  {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                  {infoMsg && <div className="alert alert-warning">{infoMsg}</div>}

                  {admin && (
                    <>
                      <div className="form-group mb-2">
                        <label>First Name: *</label>
                        <input
                          className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            clearInfo();
                          }}
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback">{errors.firstName}</div>
                        )}
                      </div>

                      <div className="form-group mb-2">
                        <label>Last Name: *</label>
                        <input
                          className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            clearInfo();
                          }}
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback">{errors.lastName}</div>
                        )}
                      </div>

                      <div className="form-group mb-2">
                        <label>Email: *</label>
                        <input
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearInfo();
                          }}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </>
                  )}

                  <div className="form-group mb-2">
                    <label>Phone:</label>
                    <input
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearInfo();
                      }}
                      placeholder="69.."
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="form-group mb-3">
                    <label>Address:</label>
                    <input
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearInfo();
                      }}
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
                        className={`form-control ${(errors.currentPassword) ? "is-invalid" : ""}`}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          clearInfo();
                        }}
                        autoComplete="current-password"
                      />

                      <span
                        className="input-group-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    </div>

                    {errors.currentPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label>New Password:</label>

                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className={`form-control ${(errors.newPassword) ? "is-invalid" : ""}`}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          clearInfo();
                        }}
                        autoComplete="new-password"
                      />

                      <span
                        className="input-group-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    </div>

                    {errors.newPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.newPassword}
                      </div>
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