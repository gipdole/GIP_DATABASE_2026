import { useContext } from "react";
import { CssBaseline, Container, Typography, Button, Toolbar, AppBar, Box } from "@mui/material";
import EmployeeTable from "./components/EmployeeTable.jsx";

import { useNavigate } from "react-router";
import { AuthContext } from "./components/context/AuthProvider.jsx";

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
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            GIP Database
                        </Typography>
                        <Button color="inherit" onClick={handleSignOut}>
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
