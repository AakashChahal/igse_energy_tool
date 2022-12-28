import * as React from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Paper,
    Box,
    Grid,
    Typography,
    Alert,
    IconButton,
    Collapse,
    FormControl,
} from "@mui/material";
import { LockPerson } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UserContext from "./userContext";

function Copyright(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            Copyright &copy;{" "}
            <Link
                color="inherit"
                href="https://www.github.com/AakashChahal/"
                target="_blank"
            >
                Aakash Chahal
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}

const theme = createTheme();

const firebaseConfig = {
    apiKey: "AIzaSyAF57fDJpxBjL2OS4R1x7vHNxGOaugdOeY",
    authDomain: "igse-energy-tool.firebaseapp.com",
    databaseURL: "https://igse-energy-tool-default-rtdb.firebaseio.com",
    projectId: "igse-energy-tool",
    storageBucket: "igse-energy-tool.appspot.com",
    messagingSenderId: "994278000336",
    appId: "1:994278000336:web:7099deec2acecbd2ee80d5",
    measurementId: "G-YGQ5LCHR41",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export default function SignIn() {
    const currentUser = React.useContext(UserContext);
    const navigate = useNavigate();
    const [errorLogin, setErrorLogin] = useState(false);
    const [successLogin, setSuccessLogin] = useState(false);
    const [open, setOpen] = useState(true);

    const getHashedPassword = async (password) => {
        const hash = await window.crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(password)
        );
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    };

    const isLoggedIn = () => {
        // Check if the user is logged in
        const user = auth.currentUser;
        if (user) return true;
        else return false;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = await getHashedPassword(data.get("password"));
        console.log("password: ", password);
        const res = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.get("email"),
                password,
            }),
        });
        console.log("response: ", res);
        // console.log("response data: ", res.json());
        const userData = await res.json();
        console.log("userData: ", userData);
        if (userData) {
            const user = userData.user;
            currentUser.setCurrentUser(user);
            setErrorLogin(false);
            setSuccessLogin(true);
            setOpen(true);
            navigate("/dashboard");
        } else {
            console.log("login failed");
            setErrorLogin(true);
            setSuccessLogin(false);
            setOpen(true);
        }
        // .then((res) => {
        //     console.log("response signin: ", res);
        //     if (res.status === 200) {
        //         // const user = auth.currentUser;
        //         // currentUser.setCurrentUser(user);
        //         setErrorLogin(false);
        //         setSuccessLogin(true);
        //         setOpen(true);
        //         // navigate("/dashboard");
        //     } else {
        //         console.log("login failed");
        //         setErrorLogin(true);
        //         setSuccessLogin(false);
        //         setOpen(true);
        //     }
        // })
        // .then((data) => {
        //     console.log("data: ", data);
        // })
        // .catch((err) => {
        //     console.error("error occured: ", err);
        // });
    };

    return (
        <ThemeProvider theme={theme}>
            {isLoggedIn() ? (
                <Navigate to="/dashboard" />
            ) : (
                <Grid container component="main" sx={{ height: "100vh" }}>
                    <CssBaseline />
                    <Grid
                        item
                        xs={false}
                        sm={4}
                        md={7}
                        sx={{
                            backgroundImage:
                                "url(https://images.unsplash.com/photo-1529704193007-e8c78f0f46f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80)",
                            backgroundRepeat: "no-repeat",
                            backgroundColor: (t) =>
                                t.palette.mode === "light"
                                    ? t.palette.grey[50]
                                    : t.palette.grey[900],
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <Grid
                        item
                        xs={12}
                        sm={8}
                        md={5}
                        component={Paper}
                        elevation={6}
                        square
                    >
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                                <LockPerson />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Sign in
                            </Typography>

                            <Box
                                component="form"
                                noValidate
                                onSubmit={handleSubmit}
                                sx={{ mt: 5 }}
                            >
                                {errorLogin && (
                                    <Collapse in={open}>
                                        <Alert
                                            severity="error"
                                            action={
                                                <IconButton
                                                    aria-label="close"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={() => {
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="inherit" />
                                                </IconButton>
                                            }
                                        >
                                            Login failed, please try again
                                        </Alert>
                                    </Collapse>
                                )}
                                {successLogin && (
                                    <Collapse in={open}>
                                        <Alert
                                            severity="success"
                                            action={
                                                <IconButton
                                                    aria-label="close"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={() => {
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="inherit" />
                                                </IconButton>
                                            }
                                        >
                                            Login successful
                                        </Alert>
                                    </Collapse>
                                )}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="remember"
                                            color="primary"
                                        />
                                    }
                                    label="Remember me"
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Sign In
                                </Button>
                                <Grid
                                    container
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "49%",
                                    }}
                                >
                                    <Grid item>
                                        <Link href="/forgot" variant="body2">
                                            Forgot password?
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link href="/register" variant="body2">
                                            Don't have an account? Register
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </ThemeProvider>
    );
}
