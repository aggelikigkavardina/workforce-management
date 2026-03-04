import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { listConversations, createConversation } from "../services/MessagesService";
import { isAdminUser } from "../services/AuthService";
import { listEmployees } from "../services/EmployeeService";

export default function MessagesListPage() {
  const navigate = useNavigate();
  const admin = isAdminUser();

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState("");

  const [search, setSearch] = useState("");

  const [newModal, setNewModal] = useState({
    open: false,
    loading: false,
    error: "",
    subject: ""
  });

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeePick, setEmployeePick] = useState("");
  const [employeePickError, setEmployeePickError] = useState("");

  const refreshThreads = async () => {
    setThreadsError("");
    setThreadsLoading(true);
    try {
      const res = await listConversations();
      setThreads(res.data || []);
    } catch (err) {
      const status = err?.response?.status;
      setThreadsError(status ? `Failed to load conversations (status ${status})` : "Failed to load conversations");
    } finally {
      setThreadsLoading(false);
    }
  };

  useEffect(() => {
    refreshThreads();
  }, []);

  useEffect(() => {
    if (newModal.open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [newModal.open]);

  const normalized = search.trim().toLowerCase();

  const filteredThreads = useMemo(() => {
    if (!normalized) return threads;
    return (threads || []).filter((t) => {
      const hay = [t.subject, t.lastMessagePreview, t.employeeName, t.employeeEmail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(normalized);
    });
  }, [threads, normalized]);

  const openNewModal = async () => {
    setNewModal({ open: true, loading: false, error: "", subject: "" });
    setEmployeePick("");
    setEmployeePickError("");

    if (admin) {
      setEmployeesLoading(true);
      try {
        const res = await listEmployees();
        setEmployees(res.data || []);
      } catch {
        setEmployees([]);
      } finally {
        setEmployeesLoading(false);
      }
    }
  };

  const closeNewModal = () => {
    if (newModal.loading) return;
    setNewModal({ open: false, loading: false, error: "", subject: "" });
    setEmployeePick("");
    setEmployeePickError("");
  };

  const createNewConversation = async () => {
    setNewModal((p) => ({ ...p, loading: true, error: "" }));
    setEmployeePickError("");

    try {
      const payload = admin
        ? { subject: newModal.subject, employeeId: employeePick ? Number(employeePick) : null }
        : { subject: newModal.subject };

      if (admin) {
        if (!employeePick || Number.isNaN(Number(employeePick))) {
          setEmployeePickError("Select an employee.");
          setNewModal((p) => ({ ...p, loading: false }));
          return;
        }
      }

      const res = await createConversation(payload);
      const newId = res?.data?.conversationId;

      closeNewModal();
      await refreshThreads();

      if (newId) {
        navigate(`/messages/${newId}`);
      }
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg = backendMsg || (status ? `Create conversation failed (status ${status})` : "Create conversation failed");
      setNewModal((p) => ({ ...p, loading: false, error: msg }));
    }
  };

  const threadTitle = (t) => (admin ? t.employeeName || t.employeeEmail || "Employee" : "Admin");
  const threadSub = (t) => (admin ? t.employeeEmail || t.subject || "" : t.subject || "");

  return (
    <>
      <div className="card d-flex flex-column" style={{ height: "75vh", overflow: "hidden" }}>
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <strong>Conversations</strong>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openNewModal}>
            <Plus size={16} />
            New message
          </button>
        </div>

        <div className="p-3 border-bottom">
          <div style={{ position: "relative" }}>
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
              className="form-control ps-5"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-grow-1" style={{ overflowY: "auto" }}>
          {threadsLoading && <div className="p-3 text-muted">Loading...</div>}

          {!threadsLoading && threadsError && (
            <div className="p-3">
              <div className="alert alert-danger m-0">{threadsError}</div>
            </div>
          )}

          {!threadsLoading && !threadsError && filteredThreads.length === 0 && (
            <div className="p-3 text-muted">
              {normalized ? "No conversations match your search." : "No conversations yet."}
            </div>
          )}

          {!threadsLoading &&
            !threadsError &&
            filteredThreads.map((t) => {
              const unread = Number(t.unreadCount || 0);

              return (
                <div
                  key={t.id}
                  className="p-3 border-bottom"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/messages/${t.id}`)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontWeight: unread > 0 ? 700 : 600 }}>{threadTitle(t)}</div>
                    {unread > 0 && <span className="badge bg-danger">{unread}</span>}
                  </div>

                  <div className="text-muted small">{threadSub(t)}</div>

                  <div className="small mt-1">
                    {t.lastMessagePreview ? <span className="text-muted">{t.lastMessagePreview}</span> : <span className="text-muted">—</span>}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {newModal.open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(2px)", zIndex: 1040 }}
            onClick={closeNewModal}
          />
          <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}>
            <div className="bg-white rounded shadow-lg" style={{ width: "100%", maxWidth: "560px", padding: "22px" }} onClick={(e) => e.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">New message</h5>
                <button className="btn btn-link text-muted p-0" onClick={closeNewModal} disabled={newModal.loading} title="Close">
                  <X size={18} />
                </button>
              </div>

              {newModal.error && <div className="alert alert-danger">{newModal.error}</div>}

              <div className="mb-2">
                <label className="form-label">Subject (optional)</label>
                <input
                  className="form-control"
                  value={newModal.subject}
                  onChange={(e) => setNewModal((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Request for shift swap"
                  disabled={newModal.loading}
                />
              </div>

              {admin && (
                <div className="mb-2">
                  <label className="form-label">To (employee)</label>

                  {employeesLoading ? (
                    <div className="text-muted">Loading employees...</div>
                  ) : (
                    <>
                      <select
                        className={`form-select ${employeePickError ? "is-invalid" : ""}`}
                        value={employeePick}
                        onChange={(e) => setEmployeePick(e.target.value)}
                        disabled={newModal.loading}
                      >
                        <option value="">Select employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} — {emp.email}
                          </option>
                        ))}
                      </select>
                      {employeePickError && <div className="invalid-feedback d-block">{employeePickError}</div>}
                    </>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary" onClick={closeNewModal} disabled={newModal.loading}>
                  Cancel
                </button>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={createNewConversation} disabled={newModal.loading}>
                  <Plus size={16} />
                  {newModal.loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}