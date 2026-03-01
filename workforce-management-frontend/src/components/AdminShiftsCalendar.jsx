import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { listEmployees } from "../services/EmployeeService";
import { getAllShifts, createShift, updateShift, deleteShift } from "../services/ShiftService";

// ----- helpers -----
const pad2 = (n) => String(n).padStart(2, "0");

// ISO -> "yyyy-MM-ddTHH:mm" for datetime-local
const toLocalInputValue = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// "yyyy-MM-ddTHH:mm" -> ISO string
const fromLocalInputValueToIso = (v) => {
  if (!v) return null;
  const d = new Date(v); // datetime-local is local time; convert to Date -> ISO
  return d.toISOString();
};

// color palette for employees
const PALETTE = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

const AdminShiftsCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set()); // employeeIds selected (view filter)
  const [allShifts, setAllShifts] = useState([]);            // raw shifts from backend
  const [errorMsg, setErrorMsg] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("CREATE"); // CREATE | EDIT
  const [editingShiftId, setEditingShiftId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [description, setDescription] = useState("");

  // assign employees for CREATE (default to current filter selection)
  const [assignIds, setAssignIds] = useState(new Set());

  useEffect(() => {
    loadEmployeesAndShifts();
  }, []);

  const loadEmployeesAndShifts = async () => {
    try {
      const empRes = await listEmployees();
      const emps = empRes.data || [];
      setEmployees(emps);

      // default: select ALL employees in view
      const all = new Set(emps.map((e) => e.id));
      setSelectedIds(all);

      // fetch ALL shifts (admin)
      const shiftsRes = await getAllShifts();
      setAllShifts(shiftsRes.data || []);
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Failed to load data.");
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data, null, 2));
    }
  };

  const colorMap = useMemo(() => {
    const m = new Map();
    employees.forEach((e, idx) => {
      m.set(e.id, PALETTE[idx % PALETTE.length]);
    });
    return m;
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const visibleEvents = useMemo(() => {
    const arr = (allShifts || []).filter((s) => selectedIds.has(s.employeeId));

    return arr.map((s) => {
      const color = colorMap.get(s.employeeId) || "#3788d8";
      return {
        id: String(s.id),
        title: s.title,
        start: s.startAt,
        end: s.endAt,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          employeeId: s.employeeId,
          notes: s.notes,
          location: s.location
        }
      };
    });
  }, [allShifts, selectedIds, colorMap]);

  const toggleSelected = (empId) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(empId)) n.delete(empId);
      else n.add(empId);
      return n;
    });
  };

  const selectAll = () => setSelectedIds(new Set(employees.map((e) => e.id)));
  const clearAll = () => setSelectedIds(new Set());

  const openCreateModalFromSelection = (selectInfo) => {
    if (selectedIds.size === 0) {
      alert("Select at least one employee first.");
      selectInfo.view.calendar.unselect();
      return;
    }

    setMode("CREATE");
    setEditingShiftId(null);

    setTitle("");
    setLocation("");
    setDescription("");

    setStartAt(toLocalInputValue(selectInfo.startStr));
    setEndAt(toLocalInputValue(selectInfo.endStr));

    // default: assign to currently selected employees in the filter
    setAssignIds(new Set(selectedIds));

    setModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const openEditModalFromEvent = (clickInfo) => {
    const ev = clickInfo.event;
    const empId = ev.extendedProps.employeeId;

    setMode("EDIT");
    setEditingShiftId(Number(ev.id));

    setTitle(ev.title || "");
    setLocation(ev.extendedProps.location || "");
    setDescription(ev.extendedProps.notes || "");

    setStartAt(toLocalInputValue(ev.start?.toISOString()));
    setEndAt(toLocalInputValue(ev.end?.toISOString()));

    // edit: assigned employee is fixed (1 shift = 1 employee)
    setAssignIds(new Set([empId]));

    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (!startAt || !endAt) return "Start and End are required.";
    const s = new Date(startAt);
    const e = new Date(endAt);
    if (!(e > s)) return "End must be after Start.";
    if (mode === "CREATE" && assignIds.size === 0) return "Select at least one employee to assign.";
    return "";
  };

  const save = async () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }

    try {
      const startIso = fromLocalInputValueToIso(startAt);
      const endIso = fromLocalInputValueToIso(endAt);

      if (mode === "EDIT") {
        const onlyEmpId = Array.from(assignIds)[0];
        const payload = {
          employeeId: Number(onlyEmpId),
          title: title.trim(),
          location: location.trim() || null,
          startAt: startIso,
          endAt: endIso,
          notes: description || ""
        };

        await updateShift(editingShiftId, payload);
      } else {
        // CREATE: for multiple employees -> loop POST once per employee
        const empIds = Array.from(assignIds);

        for (const empId of empIds) {
          const payload = {
            employeeId: Number(empId),
            title: title.trim(),
            location: location.trim() || null,
            startAt: startIso,
            endAt: endIso,
            notes: description || ""
          };
          await createShift(payload);
        }
      }

      // Reload shifts from DB (single source of truth)
      const shiftsRes = await getAllShifts();
      setAllShifts(shiftsRes.data || []);

      closeModal();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Save failed.";
      alert(msg);

      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data, null, 2));
    }
  };

  const remove = async () => {
    if (mode !== "EDIT" || !editingShiftId) return;
    const ok = window.confirm("Delete this shift?");
    if (!ok) return;

    try {
      await deleteShift(editingShiftId);

      const shiftsRes = await getAllShifts();
      setAllShifts(shiftsRes.data || []);

      closeModal();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Delete failed.";
      alert(msg);

      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data, null, 2));
    }
  };

  const toggleAssign = (empId) => {
    setAssignIds((prev) => {
      const n = new Set(prev);
      if (n.has(empId)) n.delete(empId);
      else n.add(empId);
      return n;
    });
  };

  const updateShiftFromCalendar = async (changeInfo) => {
    const ev = changeInfo.event;

    try {
      const payload = {
        employeeId: Number(ev.extendedProps.employeeId),
        title: ev.title,
        location: ev.extendedProps.location || null,
        startAt: ev.start?.toISOString(),
        endAt: ev.end?.toISOString(),
        notes: ev.extendedProps.notes || ""
      };

      await updateShift(Number(ev.id), payload);

      const shiftsRes = await getAllShifts();
      setAllShifts(shiftsRes.data || []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Update failed.";
      alert(msg);

      changeInfo.revert();
    }
  };

  // Allow drag/resize only when viewing <= 1 employee (optional safety)
  const editableOk = selectedIds.size <= 1;

  return (
    <div className="container-fluid" style={{ marginTop: "16px" }}>
      <div className="row g-3">
        {/* LEFT PANEL: employee multi-select (view filter) */}
        <div className="col-12 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Employees</h5>
                <button className="btn btn-outline-secondary btn-sm" onClick={loadEmployeesAndShifts}>
                  Refresh
                </button>
              </div>

              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              <input
                className="form-control mb-2"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="d-flex gap-2 mb-2">
                <button className="btn btn-sm btn-outline-primary" onClick={selectAll}>
                  Select all
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={clearAll}>
                  Clear
                </button>
              </div>

              <div style={{ maxHeight: 420, overflow: "auto" }}>
                {filteredEmployees.map((e) => {
                  const checked = selectedIds.has(e.id);
                  const color = colorMap.get(e.id) || "#3788d8";
                  return (
                    <div key={e.id} className="form-check d-flex align-items-center gap-2 mb-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(e.id)}
                        id={`emp-${e.id}`}
                      />
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: color,
                          display: "inline-block"
                        }}
                      />
                      <label className="form-check-label" htmlFor={`emp-${e.id}`}>
                        {e.firstName} {e.lastName}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="form-text mt-2">
                Showing shifts for <b>{selectedIds.size}</b> employee(s).
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: calendar */}
        <div className="col-12 col-lg-9">
          <div className="card">
            <div className="card-body">
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                selectable={true}
                editable={editableOk}
                eventResizableFromStart={editableOk}
                events={visibleEvents}
                select={openCreateModalFromSelection}
                eventClick={openEditModalFromEvent}
                eventDrop={updateShiftFromCalendar}
                eventResize={updateShiftFromCalendar}
                height="auto"
              />
              <div className="form-text mt-2">
                Tip: Drag on the calendar to create. Drag/resize works best when viewing 1 employee.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <>
          <div className="modal fade show" style={{ display: "block" }} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{mode === "EDIT" ? "Edit Shift" : "New Shift"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>

                <div className="modal-body">
                  {/* Title */}
                  <div className="mb-2">
                    <label className="form-label">Title *</label>
                    <input
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Morning"
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-2">
                    <label className="form-label">Location (optional)</label>
                    <input
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Store A"
                    />
                  </div>

                  {/* Start/End */}
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Start *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">End *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Assign employees (Create only) */}
                  {mode === "CREATE" && (
                    <div className="mb-2">
                      <label className="form-label">Assign to employees *</label>
                      <div className="form-text mb-2">
                        Default = employees selected in the left filter. You can adjust here.
                      </div>
                      <div style={{ maxHeight: 180, overflow: "auto" }} className="border rounded p-2">
                        {employees.map((e) => (
                          <div key={e.id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={assignIds.has(e.id)}
                              onChange={() => toggleAssign(e.id)}
                              id={`as-${e.id}`}
                            />
                            <label className="form-check-label" htmlFor={`as-${e.id}`}>
                              {e.firstName} {e.lastName} ({e.email})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Notes..."
                    />
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    {mode === "EDIT" && (
                      <button className="btn btn-danger" onClick={remove}>
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button className="btn btn-success" onClick={save}>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* backdrop */}
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default AdminShiftsCalendar;