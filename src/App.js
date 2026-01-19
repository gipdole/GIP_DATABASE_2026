import React from "react";
import { CssBaseline, Container, Typography } from "@mui/material";
import EmployeeTable from "./components/EmployeeTable";

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom mt={2}>
          GIP Database
        </Typography>
        <EmployeeTable />
      </Container>
    </>
  );
}

export default App;
