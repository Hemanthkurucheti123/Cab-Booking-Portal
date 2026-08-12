const COLORS = {
  pending: "secondary",
  accepted: "info",
  open_market: "warning",
  ongoing: "primary",
  completed: "success",
  rejected: "danger",
  cancelled: "dark",
};

function StatusBadge({ status }) {
  const color = COLORS[status] || "secondary";
  return <span className={`badge bg-${color}`}>{status}</span>;
}

export default StatusBadge;