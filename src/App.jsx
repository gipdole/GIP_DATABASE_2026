import { useContext } from "react";
import { CssBaseline, Container, Typography, Button, Toolbar, AppBar, Box } from "@mui/material";
import EmployeeTable from "./components/EmployeeTable.jsx";

import { useNavigate } from "react-router";
import { AuthContext } from "./components/context/AuthProvider.jsx";

import LogoutIcon from '@mui/icons-material/Logout';

function App() {
    const { logOut } = useContext(AuthContext);

    // Use the useNavigate hook to programmatically navigate between pages
    const navigate = useNavigate();

    // Handle user logout
    const handleSignOut = () => {
        logOut()
            .then(() => {
                console.log("User logged out successfully");
                navigate("/login"); // Redirect to the login page after logout
            })
            .catch((error) => console.error(error));
    };
    return (
        <>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed">
                    <Toolbar sx={{ backgroundColor: "#55C386", color: "#000" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexGrow: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src="/gip2026.png"   // put logo in /public
                                alt="GIP Logo"
                                sx={{
                                    height: 32,
                                    width: 32,
                                }}
                            />

                            <Typography variant="h6" component="div" fontWeight="bold">
                                GIP Database
                            </Typography>
                        </Box>

                        <Button
                            onClick={handleSignOut}
                            startIcon={<LogoutIcon />}
                            sx={{
                                color: "#000",
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
                <EmployeeTable />
            </Container>
        </>
    );
}

export default App;
