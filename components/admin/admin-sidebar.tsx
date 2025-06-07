import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleIcon from "@mui/icons-material/People"
import SettingsIcon from "@mui/icons-material/Settings"
import { Link } from "react-router-dom"

const AdminSidebar = () => {
  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        bgcolor: "background.paper",
        borderRight: "1px solid #eee",
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/admin/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/admin/users">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem button component={Link} to="/admin/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  )
}

export default AdminSidebar
