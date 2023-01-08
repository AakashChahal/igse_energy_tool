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
    Alert,
    Collapse,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { deepPurple, cyan, teal } from "@mui/material/colors";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";

const theme = createTheme({
    palette: {
        mode: "dark",
        purple: {
            main: deepPurple["A700"],
        },
        cyan: {
            main: cyan["A700"],
        },
        teal: {
            main: teal["A700"],
        },
    },
    root: {
        flexGrow: 1,
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
});

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
    const [open, setOpen] = React.useState(false);
    const [errorSubmitting, setErrorSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [successSubmitting, setSuccessSubmitting] = React.useState(false);
    const navigate = useNavigate();

    // eslint-disable-next-line
    const { data, error, loading, refetch } = useFetch("/api/reading");

    const handleSubmitMeterReadings = async (event) => {
        // Submit the meter readings with the specified submission date
        if (
            electricityMeterReadingDay === "" ||
            electricityMeterReadingNight === "" ||
            gasMeterReading === ""
        ) {
            setErrorMessage("Please fill in all the fields");
            setOpen(true);
            setErrorSubmitting(true);
            setSuccessSubmitting(false);
            return;
        }

        event.preventDefault();
        const readings = {
            customer_id: user.user.customer_id,
            submission_date: submissionDate,
            electricity_meter_reading_day: electricityMeterReadingDay,
            electricity_meter_reading_night: electricityMeterReadingNight,
            gas_meter_reading: gasMeterReading,
            status: "pending",
        };

        try {
            const response = await axios.post("/api/reading", readings);
            console.log(response);
            setOpen(true);
            setErrorSubmitting(false);
            setSuccessSubmitting(true);
            setElectricityMeterReadingDay("");
            setElectricityMeterReadingNight("");
            setGasMeterReading("");
        } catch (error) {
            setErrorMessage(
                "Some Error Occurred, while submitting meter readings, please try again"
            );
            setOpen(true);
            setErrorSubmitting(true);
            setSuccessSubmitting(false);
        }
    };

    const handlePayLatestBill = () => {
        // Pay the latest unpaid bill with the current credit amount
        navigate("/dashboard/payment");
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
                    <Grid item>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <FormControl fullWidth sx={{ gap: 2 }}>
                                <Typography component="h1" variant="h3">
                                    Submit Meter Readings
                                </Typography>
                                {errorSubmitting && (
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
                                            {errorMessage}
                                        </Alert>
                                    </Collapse>
                                )}
                                {successSubmitting && (
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
                                            Meter Readings Submitted Succesfully
                                        </Alert>
                                    </Collapse>
                                )}
                                <TextField
                                    required
                                    id="submission-date"
                                    label="Submission Date"
                                    type="date"
                                    defaultValue={submissionDate}
                                    onChange={(event) =>
                                        setSubmissionDate(event.target.value)
                                    }
                                />
                                <TextField
                                    required
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
                                    required
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
                                    required
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
                                    onClick={handleSubmitMeterReadings}
                                >
                                    Submit
                                </Button>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Typography component="h1" variant="h3">
                                Pay Latest Bill
                            </Typography>
                            <Typography component="p">
                                Latest Unpaid Bill Amount:{" "}
                                <strong>{latestUnpaidBillAmount}</strong>
                            </Typography>
                            <Typography component="p">
                                Credit Amount:{" "}
                                <strong>£{user?.user?.balance}</strong>
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
                    <Grid
                        item
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Typography component="h1" variant="h3">
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
                    <Grid
                        item
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            gap: 2,
                            mt: 4,
                        }}
                    >
                        <Box>
                            <Button
                                variant="contained"
                                color="teal"
                                onClick={() => {}}
                            >
                                View Previous Meter Readings
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                variant="contained"
                                color="purple"
                                onClick={() => {}}
                            >
                                View Current Tariff Charges
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : user?.user?.type === "admin" ? (
        <Navigate to="/admin/home" />
    ) : (
        <Navigate to="/login" />
    );
}
