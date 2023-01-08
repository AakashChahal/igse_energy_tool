import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const theme = createTheme((theme) => ({
    palette: {
        mode: "dark",
    },
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

function Navbar() {
    const { user, dispatch } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    };

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        <Link
                            to={`/${
                                user?.user?.type === "admin"
                                    ? "admin/home"
                                    : "dashboard"
                            }`}
                            style={{
                                color: "inherit",
                                textDecoration: "none",
                            }}
                        >
                            IGSE {user?.user?.type === "admin" ? "Admin" : ""}{" "}
                            Home
                        </Link>
                    </Typography>

                    <Typography
                        sx={{
                            color: "white",
                            marginLeft: "auto",
                        }}
                        variant="h6"
                    >
                        Welcome to your{" "}
                        {user?.user?.type === "admin" ? "Admin" : "Customer"}{" "}
                        Homepage
                    </Typography>

                    <Button
                        sx={{
                            color: "white",
                            "&:hover": {
                                color: "white",
                            },
                            marginLeft: "auto",
                        }}
                        color="inherit"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default Navbar;
