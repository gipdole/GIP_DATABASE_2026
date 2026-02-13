import { useState, useContext } from "react";
import { Box, Button, TextField, Typography, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { AuthContext } from "../components/context/AuthProvider.jsx";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { loginUser, loading, user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100dvh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (user) {
        navigate("/");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            await loginUser(email, password); // ✅ use state values
            navigate("/"); // redirect on success
        } catch (err) {
            console.error(err);
            setError("Invalid email or password"); // show error
        }
    };
    return (
        <Paper
            elevation={3}
            sx={{
                maxWidth: 400,
                margin: "50px auto",
                padding: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Typography variant="h5" component="h1" textAlign="center">
                Login
            </Typography>

            {error && (
                <Typography color="error" variant="body2" textAlign="center">
                    {error}
                </Typography>
            )}

            <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                    />
                    <Button variant="contained" color="primary" type="submit" fullWidth loading={loading}>
                        Login
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}
