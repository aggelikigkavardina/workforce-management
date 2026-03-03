import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { getConversation, sendMessage, markRead } from "../services/MessagesService";
import { isAdminUser } from "../services/AuthService";

export default function MessagesThreadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = isAdminUser();

  const [active, setActive] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");

  const [text, setText] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const bottomRef = useRef(null);

  const load = async (convId) => {
    setActive(null);
    setActiveError("");
    setActiveLoading(true);
    try {
      const res = await getConversation(convId);
      setActive(res.data);

      try {
        await markRead(convId);
      } catch {
        // ignore
      }
    } catch (err) {
      const status = err?.response?.status;
      setActiveError(status ? `Failed to load conversation (status ${status})` : "Failed to load conversation");
    } finally {
      setActiveLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id]);

  useEffect(() => {
    if (!active?.messages?.length) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  const onSend = async () => {
    const convId = id;
    if (!convId) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setSendLoading(true);
    try {
      await sendMessage(convId, trimmed);
      setText("");
      await load(convId); // re-load for fresh messages
    } catch (err) {
      const status = err?.response?.status;
      setActiveError(status ? `Send failed (status ${status})` : "Send failed");
    } finally {
      setSendLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border rounded d-flex flex-column" style={{ height: "75vh", overflow: "hidden" }}>
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-bold">{active?.subject || "Conversation"}</div>
          <div className="text-muted small">{admin ? "with Employee" : "with Admin"}</div>
        </div>

        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/messages")}>
          Back
        </button>
      </div>

      <div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
        {activeLoading && <div className="text-muted">Loading...</div>}
        {!activeLoading && activeError && <div className="alert alert-danger">{activeError}</div>}

        {!activeLoading && !activeError && (!active?.messages || active.messages.length === 0) && (
          <div className="text-muted">No messages yet. Say hi.</div>
        )}

        {!activeLoading &&
          !activeError &&
          active?.messages?.map((m) => {
            const mine = (admin && m.senderRole === "ROLE_ADMIN") || (!admin && m.senderRole === "ROLE_EMPLOYEE");
            return (
              <div key={m.id} className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}>
                <div style={{ maxWidth: "75%" }}>
                  <div className="small text-muted mb-1">{m.senderRole === "ROLE_ADMIN" ? "Admin" : "Employee"}</div>
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
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            disabled={sendLoading}
          />
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onSend} disabled={sendLoading} style={{ whiteSpace: "nowrap" }}>
            <Send size={16} />
            {sendLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}