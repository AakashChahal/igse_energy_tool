import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

const theme = createTheme((theme) => ({
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
    const { user } = React.useContext(AuthContext);

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="fixed">
                <Toolbar>
                    {/* <IconButton
                        edge="start"
                        className={theme.menuButton}
                        color="inherit"
                        aria-label="menu"
                    >
                        <Menu />
                    </IconButton> */}
                    <Typography variant="h6">IGSE Home</Typography>

                    <Typography
                        sx={{
                            color: "white",
                            marginLeft: "auto",
                        }}
                        variant="h6"
                    >
                        Welcome to your Homepage:{" "}
                        {user?.user?.customer_id
                            .split("@")[0]
                            .replace(/[.#$\\]/g, "_")}
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
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default Navbar;
