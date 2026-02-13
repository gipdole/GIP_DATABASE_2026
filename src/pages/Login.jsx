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
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url('/background.png')", // put image in /public
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* DARK OVERLAY */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                }}
            />
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 420,
                    textAlign: "center",
                }}
            >
                {/* LOGO */}
                <Box
                    component="img"
                    src="/gip2026.png"
                    alt="App Logo"
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        padding: 2,
                        position: "absolute",
                        top: -60,
                        left: "50%",
                        transform: "translateX(-50%)",
                        boxShadow: 3,
                        zIndex: 2,
                    }}
                />

                {/* OUTER CARD */}
                <Paper
                    elevation={3}
                    sx={{
                        pt: 10,
                        pb: 4,
                        px: 3,
                        borderRadius: 3,
                    }}
                >
                    <Typography fontWeight="bold" fontSize={18} sx={{ mt: 2 }}>
                        Login to your account
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Enter your email and password below to login to your account
                    </Typography>

                    {/* INNER CARD */}
                    <Paper
                        elevation={1}
                        sx={{
                            mt: 2,
                            p: 3,
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Email"
                                type="email"
                                placeholder="juan@example.com"
                                size="small"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <TextField
                                label="Password"
                                type="password"
                                placeholder="********"
                                size="small"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 1,
                                    backgroundColor: "#55C386",
                                    color: "#000",
                                    fontWeight: "bold",
                                }}
                                onClick={handleSubmit}
                            >
                                Login
                            </Button>
                        </Box>
                    </Paper>
                </Paper>
            </Box>
        </Box>
    );


}
