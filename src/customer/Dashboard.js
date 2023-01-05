import "../App.css";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    Grid,
    FormControl,
    TextField,
    Button,
    CssBaseline,
    Typography,
    Box,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const theme = createTheme((theme) => ({
    type: "dark",
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: "auto",
        maxWidth: 500,
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: "auto",
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
    },
}));

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
getAuth(firebaseApp);

export default function Dashboard() {
    const { user } = React.useContext(AuthContext);
    const [submissionDate, setSubmissionDate] = React.useState(
        new Date().toISOString().substring(0, 10)
    );
    const [electricityMeterReadingDay, setElectricityMeterReadingDay] =
        React.useState("");
    const [electricityMeterReadingNight, setElectricityMeterReadingNight] =
        React.useState("");
    const [gasMeterReading, setGasMeterReading] = React.useState("");
    // eslint-disable-next-line
    const [latestUnpaidBillAmount, setLatestUnpaidBillAmount] =
        React.useState("");
    // eslint-disable-next-line
    const [creditAmount, setCreditAmount] = React.useState("");
    const [evc, setEVC] = React.useState("");

    const handleSubmitMeterReadings = (event) => {
        event.preventDefault();
        // Submit meter readings to the server
    };

    const handlePayLatestBill = () => {
        // Pay the latest unpaid bill with the current credit amount
    };

    const handleTopUpCredit = () => {
        // Top up the credit with the specified EVC
    };

    return user && user.user.type === "customer" ? (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: "100vh" }}>
                <Navbar />
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={12}
                    sx={{
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Grid className={theme.meterReadingSection}>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <FormControl
                                className={theme.meterReadingForm}
                                fullWidth
                                onSubmit={handleSubmitMeterReadings}
                            >
                                <Typography
                                    component="h1"
                                    variant="h2"
                                    className={theme.meterReadingFormTitle}
                                >
                                    Submit Meter Readings
                                </Typography>
                                <TextField
                                    id="submission-date"
                                    label="Submission Date"
                                    type="date"
                                    defaultValue={submissionDate}
                                    onChange={(event) =>
                                        setSubmissionDate(event.target.value)
                                    }
                                />
                                <TextField
                                    id="electricity-meter-reading-day"
                                    label="Electricity Meter Reading (Day)"
                                    type="number"
                                    value={electricityMeterReadingDay}
                                    onChange={(event) =>
                                        setElectricityMeterReadingDay(
                                            event.target.value
                                        )
                                    }
                                />
                                <TextField
                                    id="electricity-meter-reading-night"
                                    label="Electricity Meter Readin (Night)"
                                    type="number"
                                    value={electricityMeterReadingNight}
                                    onChange={(event) =>
                                        setElectricityMeterReadingNight(
                                            event.target.value
                                        )
                                    }
                                />
                                <TextField
                                    id="gas-meter-reading"
                                    label="Gas Meter Reading"
                                    type="number"
                                    value={gasMeterReading}
                                    onChange={(event) =>
                                        setGasMeterReading(event.target.value)
                                    }
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Submit
                                </Button>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid className={theme.billPaymentSection}>
                        <Box>
                            <Typography component="h1" variant="h2">
                                Pay Latest Bill
                            </Typography>
                            <Typography component="p">
                                Latest Unpaid Bill Amount:{" "}
                                <span className={theme.billPaymentAmount}>
                                    {latestUnpaidBillAmount}
                                </span>
                            </Typography>
                            <Typography component="p">
                                Credit Amount:{" "}
                                <span className={theme.billPaymentAmount}>
                                    £{user?.user?.balance}
                                </span>
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePayLatestBill}
                            >
                                Pay
                            </Button>
                        </Box>
                    </Grid>
                    <Grid className={theme.creditTopUpSection}>
                        <Box>
                            <Typography component="h1" variant="h2">
                                Top Up Credit
                            </Typography>
                            <TextField
                                id="evc"
                                label="EVC"
                                type="number"
                                value={evc}
                                onChange={(event) => setEVC(event.target.value)}
                            />
                            <br />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleTopUpCredit}
                            >
                                Top Up
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : user.user.type === "admin" ? (
        <Navigate to="/admin/home" />
    ) : (
        <Navigate to="/login" />
    );
}
