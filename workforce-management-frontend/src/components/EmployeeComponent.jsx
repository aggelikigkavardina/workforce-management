import { useEffect, useState } from "react";
import {
  createEmployee,
  getEmployee,
  updateEmployee,
  resetEmployeePassword,
} from "../services/EmployeeService";
import { useNavigate, useParams } from "react-router-dom";
import { isValidEmail } from "../helpers/ValidationHelper";

const EmployeeComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { id } = useParams();
  const navigator = useNavigate();

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Update-mode reset password UI
  const [resetMsg, setResetMsg] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Add-mode create success modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    if (id) {
      getEmployee(id)
        .then((response) => {
          setFirstName(response.data.firstName);
          setLastName(response.data.lastName);
          setEmail(response.data.email);
          setPhone(response.data.phone || "");
          setAddress(response.data.address || "");
        })
        .catch((error) => console.error(error));
    }
  }, [id]);

  const validateForm = () => {
    let valid = true;
    const errorsCopy = { ...errors };

    if (!firstName.trim()) {
      errorsCopy.firstName = "First name is required";
      valid = false;
    } else if (firstName.length > 50) {
      errorsCopy.firstName = "Max 50 characters";
      valid = false;
    } else {
      errorsCopy.firstName = "";
    }

    if (!lastName.trim()) {
      errorsCopy.lastName = "Last name is required";
      valid = false;
    } else if (lastName.length > 50) {
      errorsCopy.lastName = "Max 50 characters";
      valid = false;
    } else {
      errorsCopy.lastName = "";
    }

    if (!email.trim()) {
      errorsCopy.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(email)) {
      errorsCopy.email = "Invalid email format";
      valid = false;
    } else if (email.length > 120) {
      errorsCopy.email = "Max 120 characters";
      valid = false;
    } else {
      errorsCopy.email = "";
    }

    if (phone.trim() && !/^69\d{8}$/.test(phone.trim())) {
      errorsCopy.phone = "Phone must be in format 69..";
      valid = false;
    } else {
      errorsCopy.phone = "";
    }

    if (address.trim().length > 255) {
      errorsCopy.address = "Address must be <= 255 characters";
      valid = false;
    } else {
      errorsCopy.address = "";
    }

    setErrors(errorsCopy);
    return valid;
  };

  const saveOrUpdateEmployee = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const employee = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() === "" ? null : phone.trim(),
      address: address.trim() === "" ? null : address.trim(),
    };

    if (id) {
      updateEmployee(id, { ...employee, id: Number(id) })
        .then(() => navigator("/employees"))
        .catch((error) => {
          console.log("STATUS:", error?.response?.status);
          console.log("DATA:", JSON.stringify(error?.response?.data, null, 2));
        });
    } else {
      createEmployee(employee)
        .then((response) => {
          const temp = response.data.temporaryPassword;
          setTempPassword(temp);
          setShowCreateModal(true);
        })
        .catch((error) => {
          console.log("STATUS:", error?.response?.status);
          console.log("DATA:", JSON.stringify(error?.response?.data, null, 2));
        });
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;

    setResetMsg(null);
    setResetLoading(true);

    try {
      const res = await resetEmployeePassword(id);
      const temp = res?.data?.temporaryPassword;

      if (temp) setResetMsg(temp);
      else setResetMsg("Temporary password generated.");
    } catch {
      setResetMsg("Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const confirmResetPassword = async () => {
    setShowResetConfirm(false);
    await handleResetPassword();
  };

  const pageTitle = () => {
    if (id) {
      return (
        <h2 className="text-center" style={{ marginTop: "10px" }}>
          Edit Employee
        </h2>
      );
    }
    return (
      <h2 className="text-center" style={{ marginTop: "10px" }}>
        Add Employee
      </h2>
    );
  };

  const goBack = () => navigator("/employees");

  const closeCreateModal = () => setShowCreateModal(false);

  return (
    <div className="container">
      <br /> <br />
      <div className="row">
        <div className="card col-md-6 offset-md-3 offset-md-3">
          {pageTitle()}
          <div className="card-body">
            <form>
              <div className="form-group mb-2">
                <label className="form-label">First Name: *</label>
                <input
                  type="text"
                  placeholder="Enter Employee First Name"
                  name="firstName"
                  value={firstName}
                  className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && (
                  <div className="invalid-feedback">{errors.firstName}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Last Name: *</label>
                <input
                  type="text"
                  placeholder="Enter Employee Last Name"
                  name="lastName"
                  value={lastName}
                  className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && (
                  <div className="invalid-feedback">{errors.lastName}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Email: *</label>
                <input
                  type="text"
                  placeholder="Enter Employee Email"
                  name="email"
                  value={email}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Phone Number:</label>
                <input
                  type="text"
                  placeholder="69.."
                  name="phone"
                  value={phone}
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Address:</label>
                <input
                  type="text"
                  placeholder="Enter Employee Address"
                  name="address"
                  value={address}
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>

              {/* RESET PASSWORD (only on update) */}
              {id && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowResetConfirm(true)}
                    disabled={resetLoading}
                  >
                    Reset Password
                  </button>

                  {resetMsg && (
                    <div className="alert alert-success mt-2 d-flex justify-content-between align-items-center">
                      <div>
                        Temporary password generated:
                        <strong className="ms-2" style={{ fontFamily: "monospace" }}>
                          {resetMsg}
                        </strong>
                      </div>

                      <Copy
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigator.clipboard.writeText(resetMsg)}
                        title="Copy"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between" style={{ marginTop: "16px" }}>
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  Back
                </button>

                <button type="button" className="btn btn-success" onClick={saveOrUpdateEmployee}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* RESET CONFIRM MODAL (update mode) */}
      {id && showResetConfirm && (
        <>
          {/* Dark overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040,
            }}
            onClick={() => setShowResetConfirm(false)}
          />

          {/* Centered modal */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
            }}
          >
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "24px",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h5 className="mb-3 text-danger">Confirm Password Reset</h5>

              <p>Are you sure you want to reset this employee's password?</p>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetLoading}
                >
                  No
                </button>

                <button
                  className="btn btn-danger"
                  onClick={confirmResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Yes, Reset"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE SUCCESS MODAL (add mode) */}
      {!id && showCreateModal && (
        <>
          {/* Dark overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040,
            }}
            onClick={closeCreateModal}
          />

          {/* Centered modal */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
            }}
          >
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "24px",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h5 className="mb-3 text-success">Employee created successfully</h5>

              <p className="mb-2 fw-semibold">You need to copy this password. </p>

              {tempPassword && (
                <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                  <div>
                    Temporary password generated: 
                    <strong className="ms-2" style={{ fontFamily: "monospace" }}>
                      {tempPassword}
                    </strong>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-primary" onClick={() => navigator("/employees")}>
                  Back to list
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeComponent;