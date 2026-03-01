import { useEffect, useState } from 'react';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMyShifts } from "../services/ShiftService";

const MyShiftsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getMyShifts();
      const mapped = (res.data || []).map((s) => ({
        id: String(s.id),
        title: s.title,
        start: s.startAt,
        end: s.endAt,
        extendedProps: { notes: s.notes }
      }));
      setEvents(mapped);
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Failed to load shifts.");
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", JSON.stringify(e?.response?.data, null, 2));
    }
  };

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">My Shifts</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

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
            editable={false}
            selectable={false}
            eventClick={(info) => {
              const notes = info.event.extendedProps?.notes;
              if (notes) alert(notes);
            }}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
};

export default MyShiftsCalendar;