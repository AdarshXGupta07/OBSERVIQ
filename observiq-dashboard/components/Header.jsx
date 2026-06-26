export default function Header({ team, lastUpdated, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">ObservIQ</span>
        {team?.name && (
          <span className="team-badge">{team.name}</span>
        )}
      </div>

      <div className="header-right">
        {lastUpdated && (
          <span className="muted-text">Last updated: {lastUpdated}</span>
        )}
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}