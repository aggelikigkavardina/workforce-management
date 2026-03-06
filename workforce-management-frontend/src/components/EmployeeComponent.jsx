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
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Update-mode reset password UI
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [resetTempPassword, setResetTempPassword] = useState(null);
  const [resetError, setResetError] = useState("");

  // Add-mode create success modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    if (id) {
      getEmployee(id)
        .then((response) => {
          setFirstName(response.data.firstName || "");
          setLastName(response.data.lastName || "");
          setEmail(response.data.email || "");
          setPhone(response.data.phone || "");
          setAddress(response.data.address || "");
        })
        .catch((error) => console.error(error));
    }
  }, [id]);

  const validateForm = () => {
    let valid = true;
    const errorsCopy = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    };

    if (!firstName.trim()) {
      errorsCopy.firstName = "First name is required";
      valid = false;
    } else if (firstName.trim().length > 50) {
      errorsCopy.firstName = "Max 50 characters";
      valid = false;
    }

    if (!lastName.trim()) {
      errorsCopy.lastName = "Last name is required";
      valid = false;
    } else if (lastName.trim().length > 50) {
      errorsCopy.lastName = "Max 50 characters";
      valid = false;
    }

    if (!email.trim()) {
      errorsCopy.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      errorsCopy.email = "Invalid email format";
      valid = false;
    } else if (email.trim().length > 120) {
      errorsCopy.email = "Max 120 characters";
      valid = false;
    }

    if (phone.trim() && !/^69\d{8}$/.test(phone.trim())) {
      errorsCopy.phone = "Phone must be in format 69XXXXXXXX";
      valid = false;
    }

    if (address.trim().length > 255) {
      errorsCopy.address = "Address must be <= 255 characters";
      valid = false;
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
        .then(() => navigate("/employees"))
        .catch((error) => {
          console.log("STATUS:", error?.response?.status);
          console.log("DATA:", JSON.stringify(error?.response?.data, null, 2));
        });
    } else {
      createEmployee(employee)
        .then((response) => {
          const temp = response?.data?.temporaryPassword || null;
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

    setResetError("");
    setResetLoading(true);

    try {
      const res = await resetEmployeePassword(id);
      console.log("RESET RES DATA:", res?.data);
      const temp = res?.data?.temporaryPassword ?? res?.data?.tempPassword ?? res?.data?.password;
      setResetTempPassword(temp || "(no password returned)");
      setShowResetSuccessModal(true);

      setResetTempPassword(temp);
      setShowResetSuccessModal(true);
    } catch (error) {
      console.error(error);
      setResetError("Failed to reset password.");
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

  const goBack = () => navigate("/employees");

  const closeCreateModal = () => setShowCreateModal(false);

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="row w-100 justify-content-center">
        <div className="card shadow-lg border-0 col-12 col-md-8 col-lg-6">
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
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
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
                  className={`form-control ${
                    errors.lastName ? "is-invalid" : ""
                  }`}
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
                  placeholder="69XXXXXXXX"
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
                  className={`form-control ${
                    errors.address ? "is-invalid" : ""
                  }`}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>

              {resetError && (
                <div className="alert alert-danger mt-3">{resetError}</div>
              )}

              {id && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowResetConfirm(true)}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              )}

              <div
                className="d-flex justify-content-between"
                style={{ marginTop: "16px" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={goBack}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={saveOrUpdateEmployee}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* RESET CONFIRM MODAL */}
      {id && showResetConfirm && (
        <>
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

              <p>Are you sure you want to reset this employee&apos;s password?</p>

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

      {/* RESET SUCCESS MODAL */}
      {id && showResetSuccessModal && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040,
            }}
            onClick={() => setShowResetSuccessModal(false)}
          />

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
              <h5 className="mb-3 text-success">
                Password reset successfully
              </h5>

              <p className="mb-2 fw-semibold">
                You need to copy this password.
              </p>

              {resetTempPassword && (
                <div className="mt-2 mb-3">
                  <div>
                    Temporary password:
                    <strong
                      className="ms-2"
                      style={{ fontFamily: "monospace" }}
                    >
                      {resetTempPassword}
                    </strong>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/employees")}
                >
                  Back to list
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE SUCCESS MODAL */}
      {!id && showCreateModal && (
        <>
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
              <h5 className="mb-3 text-success">
                Employee created successfully
              </h5>

              <p className="mb-2 fw-semibold">
                You need to copy this password.
              </p>

              {tempPassword && (
                <div className="mt-2 mb-3">
                  <div>
                    Temporary password generated:
                    <strong
                      className="ms-2"
                      style={{ fontFamily: "monospace" }}
                    >
                      {tempPassword}
                    </strong>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/employees")}
                >
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