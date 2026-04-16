import { Typography, Box } from "@mui/material";

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="body1">
        Bem-vindo ao sistema de conciliação. Aqui você verá relatórios e atalhos importantes.
      </Typography>
    </Box>
  );
}

export default Dashboard;