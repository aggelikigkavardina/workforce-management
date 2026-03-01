import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/EmployeeService";

const MyProfileComponent = () => {
  const [employee, setEmployee] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState({ phone: "", address: "" });
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setEmployee(res.data);
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
      })
      .catch((err) => console.error(err));
  }, []);

  const validate = () => {
    const e = { phone: "", address: "" };
    let ok = true;

    if (phone.trim() && !/^69\d{8}$/.test(phone.trim())) {
      e.phone = "Phone must be in format 69XXXXXXXX";
      ok = false;
    }
    if (address.length > 255) {
      e.address = "Address must be <= 255 characters";
      ok = false;
    }

    setErrors(e);
    return ok;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaveMsg(null);

    if (!validate()) return;

    try {
      const payload = {
        phone: phone.trim() === "" ? null : phone.trim(),
        address: address.trim() === "" ? null : address.trim(),
      };

      const res = await updateMyProfile(payload);
      setEmployee(res.data);
      setPhone(res.data.phone || "");
      setAddress(res.data.address || "");
      setSaveMsg("Profile updated");
    } catch (err) {
      console.log("UPDATE PROFILE ERROR:", err?.response?.data);
      const fieldErrors = err?.response?.data?.fieldErrors;
      if (fieldErrors) setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  };

  if (!employee) return <div className="container"><br />Loading...</div>;

  return (
    <div className="container">
      <h2>My Profile</h2>

      <div className="mb-2"><strong>First Name:</strong> {employee.firstName}</div>
      <div className="mb-2"><strong>Last Name:</strong> {employee.lastName}</div>
      <div className="mb-2"><strong>Email:</strong> {employee.email}</div>

      <form onSubmit={handleSave}>
        <div className="form-group mb-2">
          <label>Phone:</label>
          <input
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setPhone(phone)}
            placeholder="69XXXXXXXX"
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>

        <div className="form-group mb-2">
          <label>Address:</label>
          <input
            className={`form-control ${errors.address ? "is-invalid" : ""}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City"
          />
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>

        {saveMsg && <div className="alert alert-success mt-2">{saveMsg}</div>}

        <button className="btn btn-primary mt-2">Save</button>
      </form>
    </div>
  );
};

export default MyProfileComponent;