import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    TextField,
    Button,
    Alert,
    FormControl,
    Grid,
    Typography,
    Box,
    Link,
} from "@mui/material";

const theme = createTheme((theme) => ({
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
            margin: theme.spacing(1),
            width: "25ch",
        },
    },
}));

function ForgotPassword() {
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
    const firebase = initializeApp(firebaseConfig);
    const auth = getAuth(firebase);
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        sendPasswordResetEmail(auth, email)
            .then((res) => {
                console.log(res);
                setSuccess(true);
            })
            .catch((error) => {
                setError(error);
            });
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid
                container
                component="main"
                justifyContent="center"
                sx={{ height: "100vh", alignItems: "center" }}
            >
                <Grid item xs={12}>
                    <Box
                        mb={4}
                        sx={{
                            textAlign: "center",
                        }}
                    >
                        <Typography component="h1" variant="h2">
                            Forgot Password
                        </Typography>
                    </Box>
                    <Box>
                        <FormControl
                            fullWidth
                            className={theme.form}
                            onSubmit={handleSubmit}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {error && (
                                <Alert severity="error">{error.message}</Alert>
                            )}
                            {success && (
                                <Alert severity="success">
                                    A password reset email has been sent to your
                                    email address.
                                </Alert>
                            )}
                            <Box mb={4}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    sx={{
                                        width: "30ch",
                                    }}
                                />
                            </Box>
                            <Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    mt={4}
                                    onClick={handleSubmit}
                                >
                                    Send Password Reset Email
                                </Button>
                            </Box>
                            <Box mt={4}>
                                <Grid
                                    container
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "49%",
                                    }}
                                >
                                    <Grid item>
                                        <Link href="/login" variant="body2">
                                            Login
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link href="/register" variant="body2">
                                            Don't have an account? Register
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </FormControl>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}

export default ForgotPassword;
