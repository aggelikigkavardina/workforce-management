import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { listEmployees } from "../services/EmployeeService";
import {
  getAllShifts,
  createShift,
  updateShift,
  deleteShift
} from "../services/ShiftService";

const ShiftsCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadShifts(selectedEmployeeId);
    } else {
      setEvents([]);
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    const res = await listEmployees();
    setEmployees(res.data || []);
  };

  const loadShifts = async (employeeId) => {
    const res = await getAllShifts(employeeId);
    const mapped = (res.data || []).map((s) => ({
      id: String(s.id),
      title: s.title,
      start: s.startAt,
      end: s.endAt,
      extendedProps: {
        employeeId: s.employeeId,
        notes: s.notes
      }
    }));
    setEvents(mapped);
  };

  const handleSelect = async (info) => {
    if (!selectedEmployeeId) {
      alert("Please select an employee first.");
      return;
    }

    const title = prompt("Enter shift title:");
    if (!title) return;

    const payload = {
      employeeId: Number(selectedEmployeeId),
      title,
      startAt: info.startStr,
      endAt: info.endStr,
      notes: ""
    };

    await createShift(payload);
    loadShifts(selectedEmployeeId);
  };

  const handleEventChange = async (changeInfo) => {
    const e = changeInfo.event;

    const payload = {
      id: Number(e.id),
      employeeId: Number(selectedEmployeeId),
      title: e.title,
      startAt: e.start?.toISOString(),
      endAt: e.end?.toISOString(),
      notes: e.extendedProps.notes
    };

    await updateShift(e.id, payload);
  };

  const handleEventClick = async (clickInfo) => {
    const confirmDelete = window.confirm(
      `Delete shift "${clickInfo.event.title}"?`
    );
    if (!confirmDelete) return;

    await deleteShift(clickInfo.event.id);
    loadShifts(selectedEmployeeId);
  };

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <h2 className="mb-3">Manage Shifts</h2>

      <div className="mb-3">
        <label className="form-label">Select Employee:</label>
        <select
          className="form-select"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

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
            events={events}
            selectable={true}
            editable={true}
            select={handleSelect}
            eventChange={handleEventChange}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftsCalendar;