import { Outlet } from "react-router-dom";

export default function MessagesLayout() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Messages</h3>
      </div>
      <Outlet />
    </div>
  );
}