import { useEffect, useMemo, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { listEmployees } from "../services/EmployeeService";
import { getAllShifts, createShift, updateShift, deleteShift } from "../services/ShiftService";

import { Search, X, ChevronDown, CheckSquare, Eraser } from "lucide-react";

// ----- helpers -----
const pad2 = (n) => String(n).padStart(2, "0");

const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toTimeStr = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const buildLocalDateFromParts = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [y, m, day] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, day, hh, mm, 0, 0); // LOCAL time
};

// ---- business rules ----
const WORK_MIN_TIME = "06:00:00";
const WORK_MAX_TIME = "22:00:00";
const MAX_SHIFT_HOURS = 8;

const minutesFromDate = (d) => d.getHours() * 60 + d.getMinutes();
const MIN_WORK_MINUTES = 6 * 60; // 06:00
const MAX_WORK_MINUTES = 22 * 60; // 22:00

const isWithinWorkWindow = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const s = minutesFromDate(startDate);
  const e = minutesFromDate(endDate);
  return s >= MIN_WORK_MINUTES && e <= MAX_WORK_MINUTES;
};

const isMaxHoursOk = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const diffMs = endDate - startDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= MAX_SHIFT_HOURS;
};

// color palette for employees
const PALETTE = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf"
];

const EmployeeFilterDropdown = ({
  employees,
  colorMap,
  selectedIds,
  setSelectedIds,
  search,
  setSearch
}) => {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const toggleSelected = (empId) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(empId)) n.delete(empId);
      else n.add(empId);
      return n;
    });
  };

  const wrapperRef = useRef(null);

  const allSelected = employees.length > 0 && selectedIds.size === employees.length;
  const noneSelected = selectedIds.size === 0;
  const partiallySelected = !allSelected && !noneSelected;

  const masterCheckboxRef = useRef(null);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = partiallySelected;
    }
  }, [partiallySelected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectAll = () => setSelectedIds(new Set(employees.map((e) => e.id)));
  const clearAll = () => setSelectedIds(new Set());

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* ONE-LINE DROPDOWN FIELD */}
      <button
        type="button"
        className="form-control d-flex align-items-center justify-content-between"
        onClick={() => setOpen((p) => !p)}
        style={{
          cursor: "pointer",
          minHeight: 36,
          height: 36,
          padding: "6px 12px",
          fontSize: 14,
          background: "#fff"
        }}
      >
        <span className="d-flex align-items-center gap-2">
          <span className="fw-semibold">Employees</span>
          <span className="text-muted" style={{ fontSize: 13 }}>
            selected ({selectedIds.size})
          </span>
        </span>

        <ChevronDown size={18} className="text-muted" />
      </button>

      {/* DROPDOWN PANEL */}
      {open && (
        <div
          className="border rounded shadow-sm mt-1"
          style={{
            position: "absolute",
            zIndex: 3000,
            width: "100%",
            background: "white"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* search row */}
          <div className="p-2 border-bottom">

            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
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
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-check mt-2">
              <input
                ref={masterCheckboxRef}
                className="form-check-input"
                type="checkbox"
                id="select-all-checkbox"
                checked={allSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(new Set(employees.map((e) => e.id)));
                  } else {
                    setSelectedIds(new Set());
                  }
                }}
              />
              <label
                className="form-check-label fw-semibold"
                htmlFor="select-all-checkbox"
              >
                All employees
              </label>
            </div>

          </div>

          {/* list (max height -> ~4-6 rows + scroll) */}
          <div style={{ maxHeight: 220, overflowY: "auto" }} className="p-2">
            {filtered.map((e) => {
              const checked = selectedIds.has(e.id);
              const color = colorMap.get(e.id) || "#3788d8";

              return (
                <div key={e.id} className="form-check d-flex align-items-center gap-2 mb-1" style={{ fontSize: 14 }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelected(e.id)}
                    id={`emp-dd-${e.id}`}
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
                  <label className="form-check-label" htmlFor={`emp-dd-${e.id}`}>
                    {e.firstName} {e.lastName}
                    <span className="text-muted"> ({e.email})</span>
                  </label>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-muted" style={{ fontSize: 13 }}>
                No employees found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminShiftsCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [allShifts, setAllShifts] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("CREATE"); // CREATE | EDIT
  const [editingShiftId, setEditingShiftId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Start / End split inputs
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // assign employees dropdown (CREATE only)
  const [assignIds, setAssignIds] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");

  const [formErrors, setFormErrors] = useState({
    title: "",
    start: "",
    end: "",
    employees: ""
  });

  const assignAllSelected = employees.length > 0 && assignIds.size === employees.length;
  const assignNoneSelected = assignIds.size === 0;
  const assignPartiallySelected = !assignAllSelected && !assignNoneSelected;

  const assignMasterRef = useRef(null);

  const resetFormErrors = () => {
    setFormErrors({
      title: "",
      start: "",
      end: "",
      employees: ""
    });
  };

  useEffect(() => {
    if (assignMasterRef.current) {
      assignMasterRef.current.indeterminate = assignPartiallySelected;
    }
  }, [assignPartiallySelected]);

    useEffect(() => {
      loadEmployeesAndShifts();
    }, []);

  const loadEmployeesAndShifts = async () => {
    try {
      const empRes = await listEmployees();
      const emps = empRes.data || [];
      setEmployees(emps);

      setSelectedIds(new Set());

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
    employees.forEach((e, idx) => m.set(e.id, PALETTE[idx % PALETTE.length]));
    return m;
  }, [employees]);

  const visibleEvents = useMemo(() => {
    const arr = (allShifts || []).filter((s) => selectedIds.has(s.employeeId));

    return arr.map((s) => {
      const color = colorMap.get(s.employeeId) || "#3788d8";

      const emp = employees.find((e) => e.id === s.employeeId);
      const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : "";

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
          location: s.location,
          employeeName
        }
      };
    });
  }, [allShifts, selectedIds, colorMap, employees]);

  const resetModalFields = () => {
    setTitle("");
    setLocation("");
    setDescription("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setAssignOpen(false);
    setAssignSearch("");
  };

  const openCreateModalFromSelection = (selectInfo) => {
    if (selectedIds.size === 0) {
      selectInfo.view.calendar.unselect();
      return;
    }

    const s = selectInfo.start;
    const e = selectInfo.end;

    setMode("CREATE");
    setEditingShiftId(null);
    resetModalFields();
    resetFormErrors();

    setStartDate(toDateStr(s));
    setStartTime(toTimeStr(s));
    setEndDate(toDateStr(e));
    setEndTime(toTimeStr(e));

    // default assign = left filter selection
    setAssignIds(new Set(selectedIds));

    setModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const openEditModalFromEvent = (clickInfo) => {
    const ev = clickInfo.event;
    const empId = ev.extendedProps.employeeId;

    setMode("EDIT");
    setEditingShiftId(Number(ev.id));
    resetModalFields();
    resetFormErrors();

    setTitle(ev.title || "");
    setLocation(ev.extendedProps.location || "");
    setDescription(ev.extendedProps.notes || "");

    const s = ev.start;
    const e = ev.end;

    if (s) {
      setStartDate(toDateStr(s));
      setStartTime(toTimeStr(s));
    }
    if (e) {
      setEndDate(toDateStr(e));
      setEndTime(toTimeStr(e));
    }

    // edit = single employee
    setAssignIds(new Set([empId]));
    setModalOpen(true);
  };

  const closeModal = () => {
    setAssignOpen(false);
    setAssignSearch("");
    resetFormErrors();
    setModalOpen(false);
  };

  // assign helpers
  const toggleAssign = (empId) => {
    setAssignIds((prev) => {
      const n = new Set(prev);
      if (n.has(empId)) n.delete(empId);
      else n.add(empId);
      return n;
    });
  };

  const assignFilteredList = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(q)
    );
  }, [employees, assignSearch]);

  const validateForm = () => {
    let valid = true;

    const errorsCopy = {
      title: "",
      start: "",
      end: "",
      employees: ""
    };

    if (!title.trim()) {
      errorsCopy.title = "Title is required";
      valid = false;
    }

    if (!startDate || !startTime) {
      errorsCopy.start = "Start date/time is required";
      valid = false;
    }

    if (!endDate || !endTime) {
      errorsCopy.end = "End date/time is required";
      valid = false;
    }


    if (startDate && startTime && endDate && endTime) {
      const s = buildLocalDateFromParts(startDate, startTime);
      const e = buildLocalDateFromParts(endDate, endTime);

      if (!(e > s)) {
        errorsCopy.end = "End must be after Start";
        valid = false;
      }
    }

    if (mode === "CREATE" && assignIds.size === 0) {
      errorsCopy.employees = "Select at least one employee";
      valid = false;
    }

    setFormErrors(errorsCopy);
    return valid;
  };

  const save = async () => {

    if (!validateForm()) return;

    try {
      const s = buildLocalDateFromParts(startDate, startTime);
      const e = buildLocalDateFromParts(endDate, endTime);

      const startIso = s.toISOString();
      const endIso = e.toISOString();

      if (mode === "EDIT") {
        const onlyEmpId = Array.from(assignIds)[0];

        const payload = {
          id: Number(editingShiftId),
          employeeId: Number(onlyEmpId),
          title: title.trim(),
          location: location.trim() || null,
          startAt: startIso,
          endAt: endIso,
          notes: description || ""
        };

        await updateShift(editingShiftId, payload);
      } else {
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

      const shiftsRes = await getAllShifts();
      setAllShifts(shiftsRes.data || []);

      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Save failed.";
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
      const msg = e?.response?.data?.message || e?.response?.data || "Delete failed.";
      alert(msg);
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data, null, 2));
    }
  };

  const updateShiftFromCalendar = async (changeInfo) => {
    const ev = changeInfo.event;
    const s = ev.start;
    const e = ev.end;

    if (!s || !e) {
      alert("Invalid dates.");
      changeInfo.revert();
      return;
    }
    if (!isWithinWorkWindow(s, e)) {
      alert("Shift must be between 06:00 and 22:00.");
      changeInfo.revert();
      return;
    }
    if (!isMaxHoursOk(s, e)) {
      alert("Shift cannot exceed 8 hours.");
      changeInfo.revert();
      return;
    }

    try {
      const payload = {
        id: Number(ev.id),
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
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data || "Update failed.";
      alert(msg);
      changeInfo.revert();
    }
  };

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;

    const employeeName = event.extendedProps.employeeName || "";
    const start = event.start;
    const end = event.end;

    const formatTime = (d) =>
      d
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

    const timeRange =
      start && end ? `${formatTime(start)} - ${formatTime(end)}` : "";

    return (
      <div
        style={{
          fontSize: 9.5,         
          lineHeight: 1.5,
          padding: "2px 3px",
          overflow: "hidden"
        }}
      >
        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {employeeName}
        </div>

        <div style={{ opacity: 0.9 }}>
          {timeRange}
        </div>

        {event.title && (
          <div style={{ opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {event.title}
          </div>
        )}
      </div>
    );
  };

  const canInteractWithCalendar = selectedIds.size > 0;

  return (
    <div
      className="container py-2"
      style={{
        height: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/* FILTER TOOLBAR */}
      <div className="mb-3">
        <EmployeeFilterDropdown
          employees={employees}
          colorMap={colorMap}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* CALENDAR */}
      <div className="card flex-grow-1 d-flex flex-column">
        <div className="card-body p-2 d-flex flex-column">
          <div style={{ flex: 1, overflow: "auto" }}>
            <FullCalendar
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              selectable={canInteractWithCalendar}
              selectAllow={() => canInteractWithCalendar}
              editable={canInteractWithCalendar}
              eventResizableFromStart={canInteractWithCalendar}
              events={visibleEvents}
              eventContent={renderEventContent}
              select={openCreateModalFromSelection}
              eventClick={openEditModalFromEvent}
              eventDrop={updateShiftFromCalendar}
              eventResize={updateShiftFromCalendar}

              height="100%"
              slotMinTime={WORK_MIN_TIME}
              slotMaxTime={WORK_MAX_TIME}
              scrollTime={WORK_MIN_TIME}
              slotDuration="00:30:00"
              allDaySlot={false}
              expandRows={false}
              contentHeight="100%"
            />
          </div>
          <div className="form-text mt-2">
            Tip: Select employees from dropdown. Drag to create shift.
          </div>
        </div>
      </div>

      {/* CUSTOM MODAL */}
      {modalOpen && (
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
            onClick={closeModal}
          />

          {/* centered card */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
              padding: "14px"
            }}
          >
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: "100%",
                maxWidth: "820px",
                maxHeight: "calc(100vh - 28px)",
                overflowY: "auto",
                padding: "18px",
                paddingBottom: "18px"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="m-0">{mode === "EDIT" ? "Edit Shift" : "New Shift"}</h4>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Allowed: 06:00–22:00 · Max duration: 8 hours
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={closeModal}
                  aria-label="Close"
                  style={{ lineHeight: 0 }}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Title: *</label>
                  <input
                    className={`form-control ${formErrors.title ? "is-invalid" : ""}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title"
                  />
                  {formErrors.title && (
                    <div className="invalid-feedback">
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Location:</label>
                  <input
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location"
                  />
                </div>

                {/* Start */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Start: *</label>

                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      className={`form-control ${formErrors.start ? "is-invalid" : ""}`}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className={`form-control ${formErrors.start ? "is-invalid" : ""}`}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      step="900"
                      style={{ maxWidth: 180 }}
                    />
                  </div>

                  {formErrors.start && (
                    <div className="invalid-feedback d-block">
                      {formErrors.start}
                    </div>
                  )}
                </div>

                {/* End */}
                <div className="col-12 col-md-6">
                  <label className="form-label">End: *</label>

                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      className={`form-control ${formErrors.end ? "is-invalid" : ""}`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className={`form-control ${formErrors.end ? "is-invalid" : ""}`}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      step="900"
                      style={{ maxWidth: 180 }}
                    />
                  </div>

                  {formErrors.end && (
                    <div className="invalid-feedback d-block">
                      {formErrors.end}
                    </div>
                  )}
                </div>

                {mode === "CREATE" && (
                  <div className="col-12">
                    <label className="form-label">Assign employees: *</label>

                    <div style={{ position: "relative" }} className="mt-1">
                      {/* ONE-LINE FIELD (same style as outside) */}
                      <button
                        type="button"
                        className={`form-control d-flex align-items-center justify-content-between ${
                          formErrors.employees ? "is-invalid" : ""
                        }`}
                        onClick={() => setAssignOpen((p) => !p)}
                        style={{
                          cursor: "pointer",
                          minHeight: 36,
                          height: 36,
                          padding: "6px 12px",
                          fontSize: 14,
                          background: "#fff"
                        }}
                      >
                        <span className="d-flex align-items-center gap-2">
                          <span className="text-muted" style={{ fontSize: 13 }}>
                            Employees selected ({assignIds.size})
                          </span>
                        </span>

                        <ChevronDown size={18} className="text-muted" />
                      </button>

                      {formErrors.employees && (
                          <div className="invalid-feedback d-block">
                            {formErrors.employees}
                          </div>
                        )}

                      {assignOpen && (
                        <div
                          className="border rounded shadow-sm mt-1"
                          style={{
                            position: "absolute",
                            zIndex: 2000,
                            width: "100%",
                            background: "white"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* SEARCH (same style) + MASTER CHECK */}
                          <div className="p-2 border-bottom">
                            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
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
                                  placeholder="Search employees..."
                                  value={assignSearch}
                                  onChange={(e) => setAssignSearch(e.target.value)}
                                  autoFocus
                                />
                              </div>

                              {/* close icon */}
                              <button
                                type="button"
                                className="btn btn-link p-0"
                                onClick={() => {
                                  setAssignOpen(false);
                                  setAssignSearch("");
                                }}
                                aria-label="Close"
                                style={{ lineHeight: 0 }}
                              >
                                <X size={20} />
                              </button>
                            </div>

                            {/* MASTER CHECKBOX */}
                            <div className="form-check mt-2">
                              <input
                                ref={assignMasterRef}
                                className="form-check-input"
                                type="checkbox"
                                id="assign-all"
                                checked={assignAllSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignIds(new Set(employees.map((x) => x.id)));
                                  } else {
                                    setAssignIds(new Set());
                                  }
                                }}
                              />
                              <label className="form-check-label fw-semibold" htmlFor="assign-all">
                                All employees
                              </label>
                            </div>
                          </div>

                          {/* LIST */}
                          <div style={{ maxHeight: 220, overflowY: "auto" }} className="p-2">
                            {assignFilteredList.map((e) => (
                              <div
                                key={e.id}
                                className="form-check d-flex align-items-center gap-2 mb-1"
                                style={{ fontSize: 14 }}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={assignIds.has(e.id)}
                                  onChange={() => toggleAssign(e.id)}
                                  id={`as-${e.id}`}
                                />
                                <label className="form-check-label" htmlFor={`as-${e.id}`}>
                                  {e.firstName} {e.lastName}
                                  <span className="text-muted"> ({e.email})</span>
                                </label>
                              </div>
                            ))}

                            {assignFilteredList.length === 0 && (
                              <div className="text-muted" style={{ fontSize: 13 }}>
                                No employees found.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Description:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes..."
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
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
        </>
      )}
    </div>
  );
};

export default AdminShiftsCalendar;