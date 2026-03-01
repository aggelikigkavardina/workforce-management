import { useEffect, useMemo, useRef, useState } from "react";
import {
  listConversations,
  createConversation,
  getConversation,
  sendMessage,
  markRead
} from "../services/MessagesService";
import { isAdminUser } from "../services/AuthService";
import { listEmployees } from "../services/EmployeeService";
import { Plus, Search, Send, X } from "lucide-react";

const MessagesComponent = () => {
  const admin = isAdminUser();

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState("");

  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");

  const [text, setText] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const [search, setSearch] = useState("");

  // New message modal
  const [newModal, setNewModal] = useState({
    open: false,
    loading: false,
    error: "",
    subject: ""
  });

  // admin: choose employee (from employees list)
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeePick, setEmployeePick] = useState(""); // will store employee.userId (see below)
  const [employeePickError, setEmployeePickError] = useState("");

  // scroll to bottom of messages
  const bottomRef = useRef(null);

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

  const loadConversation = async (id, opts = { markRead: true }) => {
    if (!id) return;

    setActiveId(id);
    setActive(null);
    setActiveError("");
    setActiveLoading(true);

    try {
      const res = await getConversation(id);
      setActive(res.data);

      if (opts.markRead) {
        try {
          await markRead(id);
        } catch {
          // ignore markRead failures
        }
        // refresh list so badge updates + ordering if needed
        refreshThreads();
      }
    } catch (err) {
      const status = err?.response?.status;
      setActiveError(status ? `Failed to load conversation (status ${status})` : "Failed to load conversation");
    } finally {
      setActiveLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    refreshThreads();
  }, []);

  // auto scroll on messages change
  useEffect(() => {
    if (!active?.messages?.length) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  // lock body scroll for modal (same style as your listEmployees modals)
  useEffect(() => {
    if (newModal.open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [newModal.open]);

  const normalized = search.trim().toLowerCase();

  const filteredThreads = useMemo(() => {
    if (!normalized) return threads;

    return (threads || []).filter((t) => {
      const hay = [
        t.subject,
        t.lastMessagePreview,
        t.employeeName,
        t.employeeEmail
      ]
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
      // Load employees for dropdown
      setEmployeesLoading(true);
      try {
        const res = await listEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        // if employees fail to load, we still allow manual input fallback (optional)
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
        await loadConversation(newId, { markRead: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg =
        backendMsg ||
        (status ? `Create conversation failed (status ${status})` : "Create conversation failed");

      setNewModal((p) => ({ ...p, loading: false, error: msg }));
    }
  };

  const onSend = async () => {
    if (!activeId) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setSendLoading(true);
    try {
      await sendMessage(activeId, trimmed);
      setText("");

      // reload details
      const res = await getConversation(activeId);
      setActive(res.data);

      // refresh list for preview/unread/order
      refreshThreads();
    } catch (err) {
      // show inline error in activeError (same pattern)
      const status = err?.response?.status;
      setActiveError(status ? `Send failed (status ${status})` : "Send failed");
    } finally {
      setSendLoading(false);
    }
  };

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const threadTitle = (t) => {
    if (admin) return t.employeeName || t.employeeEmail || "Employee";
    return "Admin";
  };

  const threadSub = (t) => {
    // optional: show subject or email
    if (admin) return t.employeeEmail || t.subject || "";
    return t.subject || "";
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Messages</h3>
      </div>

      <div className="row g-3" style={{ height: "75vh" }}>
        {/* LEFT: conversations */}
        <div className="col-12 col-md-4">
          <div className="border rounded h-100 d-flex flex-column" style={{ overflow: "hidden" }}>
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
                  const isActive = t.id === activeId;
                  const unread = Number(t.unreadCount || 0);

                  return (
                    <div
                      key={t.id}
                      className={`p-3 border-bottom ${isActive ? "bg-light" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => loadConversation(t.id, { markRead: true })}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{ fontWeight: unread > 0 ? 700 : 600 }}>
                          {threadTitle(t)}
                        </div>
                        {unread > 0 && <span className="badge bg-danger">{unread}</span>}
                      </div>

                      <div className="text-muted small">
                        {threadSub(t)}
                      </div>

                      <div className="small mt-1">
                        {t.lastMessagePreview ? (
                          <span className="text-muted">{t.lastMessagePreview}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT: active conversation */}
        <div className="col-12 col-md-8">
          <div className="border rounded h-100 d-flex flex-column" style={{ overflow: "hidden" }}>
            <div className="p-3 border-bottom">
              {activeId ? (
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="fw-bold">{active?.subject || "Conversation"}</div>
                    <div className="text-muted small">
                      {admin
                        ? (threads.find((x) => x.id === activeId)?.employeeEmail || "")
                        : "with Admin"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted">Select a conversation to start.</div>
              )}
            </div>

            <div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
              {activeLoading && <div className="text-muted">Loading...</div>}

              {!activeLoading && activeError && (
                <div className="alert alert-danger">{activeError}</div>
              )}

              {!activeLoading && !activeError && activeId && (!active?.messages || active.messages.length === 0) && (
                <div className="text-muted">No messages yet. Say hi.</div>
              )}

              {!activeLoading && !activeError && active?.messages?.map((m) => {
                const mine = (admin && m.senderRole === "ROLE_ADMIN") || (!admin && m.senderRole === "ROLE_EMPLOYEE");
                // (Αν θες ακριβές "mine", καλύτερα να στέλνεις senderId + να έχεις currentUserId. Εδώ το κάνουμε role-based για simplicity.)

                return (
                  <div
                    key={m.id}
                    className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div style={{ maxWidth: "75%" }}>
                      <div className="small text-muted mb-1">
                        {m.senderRole === "ROLE_ADMIN" ? "Admin" : "Employee"}
                      </div>
                      <div className="p-2 border rounded bg-white">
                        <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-top">
              <div className="d-flex gap-2">
                <textarea
                  className="form-control"
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={activeId ? "Type a message... (Enter to send, Shift+Enter for new line)" : "Select a conversation first"}
                  disabled={!activeId || sendLoading}
                />
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={onSend}
                  disabled={!activeId || sendLoading}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Send size={16} />
                  {sendLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW MESSAGE MODAL */}
      {newModal.open && (
        <>
          {/* overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1040
            }}
            onClick={closeNewModal}
          />

          {/* modal */}
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
              style={{ width: "100%", maxWidth: "560px", padding: "22px" }}
              onClick={(e) => e.stopPropagation()}
            >
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
    </div>
  );
};

export default MessagesComponent;