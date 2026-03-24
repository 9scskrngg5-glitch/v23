/**
 * @param {{ active?: boolean, payload?: any[] }} props
 */
export const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const positive = val >= 0;

  return (
    <div
      style={{
        background: "#080a10",
        border: `1px solid ${positive ? "rgba(0,229,160,0.4)" : "rgba(255,77,109,0.4)"}`,
        borderRadius: 10,
        padding: "7px 13px",
        fontSize: 13,
        color: positive ? "#00e5a0" : "#ff4d6d",
        fontFamily: "'DM Mono', monospace",
        boxShadow: `0 4px 20px ${positive ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)"}`,
      }}
    >
      {val > 0 ? "+" : ""}{val}$
    </div>
  );
};
