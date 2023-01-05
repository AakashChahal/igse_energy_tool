import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
                        IGSE {user?.user?.type === "admin" ? "Admin" : ""} Home
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
