import type React from "react"
import { Link } from "react-router-dom"

const PortalNavigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/appointments">Appointments</Link>
        </li>
        <li>
          <Link to="/messages">Messages</Link>
        </li>
        <li>
          <Link to="/medical-records">Medical Records</Link>
        </li>
        <li>
          <Link to="/billing">Billing</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  )
}

export default PortalNavigation
