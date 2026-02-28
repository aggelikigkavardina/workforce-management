import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee, listEmployees } from '../services/EmployeeService';
import { isAdminUser } from '../services/AuthService';
import { Eye, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { getEmployee } from "../services/EmployeeService";

const ListEmployeeComponent = () => {
  const [employees, setEmployees] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    employee: null,
    loading: false,
    error: ""
  });

  const [detailsModal, setDetailsModal] = useState({
    open: false,
    id: null,
    loading: false,
    error: "",
    employee: null
  });

  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [flash, setFlash] = useState({ success: "" });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  const navigator = useNavigate();

  useEffect(() => {
    getAllEmployees();
  }, []);

  useEffect(() => {
    if (detailsModal.open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [detailsModal.open]);

  useEffect(() => {
    if (deleteModal.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [deleteModal.open]);

  useEffect(() => {
    setPage(0);
  }, [search, sortBy, sortDir]);

  function getAllEmployees() {
    setLoadError(null);

    listEmployees()
      .then((response) => {
        setEmployees(response.data);
        setPage(0);
      })
      .catch((error) => {
        console.error('listEmployees failed:', error);
        const status = error?.response?.status;
        setLoadError(status ? `Request failed with status ${status}` : 'Request failed');
      });
  }

  function addNewEmployee() {
    navigator('/add-employee');
  }

  function updateEmployee(id) {
    navigator(`/edit-employee/${id}`);
  }

  async function removeEmployeeConfirmed() {
    const emp = deleteModal.employee;
    if (!emp) return;

    setFlash({ success: "" });
    setDeleteModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      await deleteEmployee(emp.id);

      setDeleteModal({ open: false, employee: null, loading: false, error: "" });
      setFlash({ success: "Employee deleted successfully." });

      getAllEmployees();
    } catch (error) {
      console.error("deleteEmployee failed:", error);

      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.error || error?.response?.data?.message;

      let msg = "Delete failed.";
      if (status === 404) msg = "Employee not found.";
      if (status === 409) msg = "Cannot delete employee (conflict - maybe has shifts).";
      if (status === 400) msg = backendMsg || "Invalid delete request.";

      setDeleteModal((prev) => ({ ...prev, loading: false, error: msg }));
    }
  }

  function openDeleteModal(employee) {
    setFlash({ success: "" });
    setDeleteModal({ open: true, employee, loading: false, error: "" });
  }

  function closeDeleteModal() {
    if (deleteModal.loading) return;
    setDeleteModal({ open: false, employee: null, loading: false, error: "" });
  }

  function openDetailsModal(employeeId) {
    setDetailsModal({
      open: true,
      id: employeeId,
      loading: true,
      error: "",
      employee: null
    });

    getEmployee(employeeId)
      .then((res) => {
        setDetailsModal((prev) => ({
          ...prev,
          loading: false,
          employee: res.data
        }));
      })
      .catch((error) => {
        console.error("getEmployee failed:", error);
        const status = error?.response?.status;
        setDetailsModal((prev) => ({
          ...prev,
          loading: false,
          error: status ? `Request failed with status ${status}` : "Request failed"
        }));
      });
  }

  function closeDetailsModal() {
    setDetailsModal({ open: false, id: null, loading: false, error: "", employee: null });
  }

  function goEditFromModal() {
    if (!detailsModal.id) return;
    closeDetailsModal();
    navigator(`/edit-employee/${detailsModal.id}`);
  }

  const normalized = search.trim().toLowerCase();

  const filteredEmployees = employees.filter((e) => {
    if (!normalized) return true;

    const haystack = [
      e.firstName,
      e.lastName,
      e.email,
      e.phone,
      e.address
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const av = (a?.[sortBy] ?? "").toString().toLowerCase();
    const bv = (b?.[sortBy] ?? "").toString().toLowerCase();

    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedEmployees.length / pageSize);

  const pagedEmployees = sortedEmployees.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  function handleSort(columnKey) {
    if (sortBy === columnKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortDir("asc");
    }
  }

  function sortIcon(columnKey) {
    if (sortBy !== columnKey) return "↕";     // not active
    return sortDir === "asc" ? "↑" : "↓";     // active
  }

  return (
    <div className='container'>
      <br /><br />
      <h2 className='text-center'>List of Employees</h2>

      {loadError && (
        <div className='alert alert-danger'>
           No employees loaded {loadError}. Console/Network.
        </div>
      )}

      {flash.success && (
        <div className="alert alert-success">
          {flash.success}
        </div>
      )}

      {isAdminUser() && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className='btn btn-primary d-flex align-items-center gap-2'
            onClick={addNewEmployee}
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div style={{ minWidth: "240px", flex: 1, position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              top: "50%",
              left: "12px",
              transform: "translateY(-50%)",
              color: "#6c757d"
            }}
          />

          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search (name, email, phone...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div> 

      <table className='table table-striped table-bordered table-hover align-middle'>
        <thead>
          <tr>
            <th
              style={{ cursor: "pointer", userSelect: "none", background: sortBy === "firstName" ? "rgba(0,0,0,0.04)" : undefined }}
              onClick={() => handleSort("firstName")}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>First Name</span>
                <span>{sortIcon("firstName")}</span>
              </div>
            </th>

            <th
              style={{ cursor: "pointer", userSelect: "none", background: sortBy === "firstName" ? "rgba(0,0,0,0.04)" : undefined }}
              onClick={() => handleSort("lastName")}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Last Name</span>
                <span>{sortIcon("lastName")}</span>
              </div>
            </th>

            <th
              style={{ cursor: "pointer", userSelect: "none", background: sortBy === "firstName" ? "rgba(0,0,0,0.04)" : undefined }}
              onClick={() => handleSort("email")}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Email</span>
                <span>{sortIcon("email")}</span>
              </div>
            </th>

            <th
              style={{ cursor: "pointer", userSelect: "none", background: sortBy === "firstName" ? "rgba(0,0,0,0.04)" : undefined }}
              onClick={() => handleSort("phone")}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Phone</span>
                <span>{sortIcon("phone")}</span>
              </div>
            </th>

            {isAdminUser() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pagedEmployees.map((employee) => (
            <tr key={employee.id}
              style={{ cursor: 'pointer' }}
              onClick={() => openDetailsModal(employee.id)}
            >
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
              <td>{employee.email}</td>
              <td>{employee.phone || "-"}</td>

              {isAdminUser() && (
                <td
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='d-flex gap-2'>

                    <button
                      className='btn btn-link text-secondary p-0'
                      onClick={() => openDetailsModal(employee.id)}
                      title='View Details'
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className='btn btn-link text-primary p-0'
                      onClick={() => updateEmployee(employee.id)}
                      title='Edit Employee'
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className='btn btn-link text-danger p-0'
                      onClick={() => openDeleteModal(employee)}
                      title='Delete Employee'
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {deleteModal.open && (
        <>
          {/* Dark overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040
            }}
          />

          {/* Centered modal */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050
            }}
          >
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "24px",
                animation: "fadeIn 0.2s ease-out"
              }}
            >
              <h5 className="mb-3 text-danger">Confirm Delete</h5>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {deleteModal.employee?.firstName}{" "}
                  {deleteModal.employee?.lastName}
                </strong>
                ?
              </p>

              {deleteModal.error && (
                <div className="alert alert-danger">
                  {deleteModal.error}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                  disabled={deleteModal.loading}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={removeEmployeeConfirmed}
                  disabled={deleteModal.loading}
                >
                  {deleteModal.loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {sortedEmployees.length > pageSize && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>

          <span>
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {detailsModal.open && (
        <>
          {/* overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040
            }}
            onClick={closeDetailsModal}
          />

          {/* modal center */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050
            }}
          >
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: "100%",
                maxWidth: "520px",
                padding: "22px"
              }}
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Employee Details</h5>
                <button className="btn-close" onClick={closeDetailsModal} />
              </div>

              {detailsModal.loading && <div>Loading...</div>}

              {!detailsModal.loading && detailsModal.error && (
                <div className="alert alert-danger">{detailsModal.error}</div>
              )}

              {!detailsModal.loading && !detailsModal.error && detailsModal.employee && (
                <>
                  <div className="mb-2">
                    <strong>First Name:</strong> {detailsModal.employee.firstName}
                  </div>
                  <div className="mb-2">
                    <strong>Last Name:</strong> {detailsModal.employee.lastName}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {detailsModal.employee.email}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {detailsModal.employee.phone || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> {detailsModal.employee.address || "-"}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button className="btn btn-secondary" onClick={closeDetailsModal}>
                      Close
                    </button>
                    <button className="btn btn-primary" onClick={goEditFromModal}>
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {!loadError && sortedEmployees.length === 0 && (
        <div className="text-muted">
          {search.trim()
            ? "No employees match your search."
            : "Employees don't exist or data didn't load."}
        </div>
      )}
    </div>
  );
};

export default ListEmployeeComponent;