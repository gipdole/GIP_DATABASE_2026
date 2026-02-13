import { useContext } from "react";
import { AuthContext } from "./AuthProvider.jsx";
import { Navigate } from "react-router";
import { CircularProgress, Box } from "@mui/material";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
    const { loading, user } = useContext(AuthContext);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100dvh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (user) {
        return children;
    }

    return <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
    children: PropTypes.node,
};

export default PrivateRoute;
