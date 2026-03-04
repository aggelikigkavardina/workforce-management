import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMyShifts } from "../services/ShiftService";

const WORK_MIN_TIME = "06:00:00";
const WORK_MAX_TIME = "22:00:00";

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
        extendedProps: { notes: s.notes, location: s.location }
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
    <div
      className="container py-2"
      style={{
        height: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

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
              events={events}
              editable={false}
              selectable={false}
              eventClick={(info) => {
                const notes = info.event.extendedProps?.notes;
                if (notes) alert(notes);
              }}
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
            Tip: Click a shift to view notes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyShiftsCalendar;