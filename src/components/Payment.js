import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Grid,
    CssBaseline,
    FormControl,
} from "@mui/material";

// Create a theme object to customize the look and feel of the components
const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#0074D9",
        },
    },
});

function PaymentPage() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Grid
                component="main"
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "2rem",
                    textAlign: "center",
                }}
            >
                <Typography variant="h3" gutterBottom>
                    IGSE Payment Page
                </Typography>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        PAYMENT
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        Amount: $100
                    </Typography>
                    <Card>
                        <CardContent>
                            <FormControl
                                sx={{
                                    minWidth: "50vw",
                                }}
                            >
                                <TextField
                                    label="Card number"
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Expiration date"
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Security code"
                                    fullWidth
                                    margin="normal"
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    Pay
                                </Button>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}

export default PaymentPage;
