import "../App.css";
import React, { useEffect } from "react";
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
import { Chart } from "react-google-charts";

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

export const meterReadings = [];
export const tariffData = [];

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
    const [latestUnpaidBillAmount, setLatestUnpaidBillAmount] =
        React.useState(0);
    // eslint-disable-next-line
    const [creditAmount, setCreditAmount] = React.useState("");
    const [evc, setEVC] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [errorSubmitting, setErrorSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [successSubmitting, setSuccessSubmitting] = React.useState(false);
    let [showMeterReadingsTable, setShowMeterReadingsTable] =
        React.useState(false);
    let [showTariffChargesTable, setShowTariffChargesTable] =
        React.useState(false);
    const [billPaid, setBillPaid] = React.useState(false);
    const [billPaidMessage, setBillPaidMessage] = React.useState("");
    const [showBillMessage, setShowBillMessage] = React.useState(false);

    let { data, refetch } = useFetch(`/api/reading/${user.user.customer_id}`);
    let reading_id = 0;
    const tariff = axios.get("/api/tariff");
    // eslint-disable-next-line
    const navigate = useNavigate();

    const calcLatestBill = async () => {
        if (data) {
            // await refetch();
            const readingData = data.reading;
            if (readingData && !readingData.length < 2) {
                let bill = 0;
                for (let i = 0; i < readingData.length - 1; i++) {
                    if (readingData[i] && readingData[i].status === "pending") {
                        if (!readingData[i + 1]) {
                            setLatestUnpaidBillAmount("No pending bills");
                        }
                        reading_id = i;
                        const latestReading = readingData[i + 1];
                        const secondLatestReading = readingData[i];
                        const currTariff = (await tariff).data.tariffs;
                        bill +=
                            currTariff["electricity_day"].rate *
                                (latestReading.electricity_meter_reading_day -
                                    secondLatestReading.electricity_meter_reading_day) +
                            currTariff["electricity_night"].rate *
                                (latestReading.electricity_meter_reading_night -
                                    secondLatestReading.electricity_meter_reading_night) +
                            currTariff["gas"].rate *
                                (latestReading.gas_meter_reading -
                                    secondLatestReading.gas_meter_reading) +
                            (currTariff["standing"].rate *
                                Math.abs(
                                    new Date(
                                        latestReading.submission_date
                                    ).getTime() -
                                        new Date(
                                            secondLatestReading.submission_date
                                        ).getTime()
                                )) /
                                (1000 * 60 * 60 * 24);
                        break;
                    }
                }
                setLatestUnpaidBillAmount(bill);
            } else {
                setLatestUnpaidBillAmount("No bills due yet.");
            }
        } else {
            setLatestUnpaidBillAmount("calculating...");
        }
    };

    const handleSubmitMeterReadings = async (event) => {
        event.preventDefault();
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
        } else if (
            electricityMeterReadingDay <= 0 ||
            electricityMeterReadingNight <= 0 ||
            gasMeterReading <= 0
        ) {
            setErrorMessage("Please enter a positive number");
            setOpen(true);
            setErrorSubmitting(true);
            setSuccessSubmitting(false);
            return;
        } else if (
            electricityMeterReadingDay <
                (await data.reading[data.reading.length - 1]
                    .electricity_meter_reading_day) ||
            electricityMeterReadingNight <
                (await data.reading[data.reading.length - 1]
                    .electricity_meter_reading_night) ||
            gasMeterReading <
                (await data.reading[data.reading.length - 1].gas_meter_reading)
        ) {
            console.log(electricityMeterReadingDay);
            console.log(electricityMeterReadingNight);
            console.log(gasMeterReading);
            console.log(
                data.reading[data.reading.length - 1]
                    .electricity_meter_reading_day
            );
            console.log(
                data.reading[data.reading.length - 1]
                    .electricity_meter_reading_night
            );
            console.log(
                data.reading[data.reading.length - 1].gas_meter_reading
            );

            setErrorMessage(
                "New Reading should be greater than the previous reading."
            );
            setOpen(true);
            setErrorSubmitting(true);
            setSuccessSubmitting(false);
            return;
        }
        const readings = {
            customer_id: user.user.customer_id,
            submission_date: submissionDate,
            electricity_meter_reading_day: electricityMeterReadingDay,
            electricity_meter_reading_night: electricityMeterReadingNight,
            gas_meter_reading: gasMeterReading,
            status: "pending",
        };

        try {
            await axios.post("/api/reading", readings);
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

    const handlePayLatestBill = async () => {
        // Pay the latest bill using the credits available
        const credit = user?.user?.balance;
        const latestBill = latestUnpaidBillAmount;
        if (typeof latestBill === "string" || latestBill === 0) {
            setBillPaid(false);
            setBillPaidMessage("No pending bills");
            setShowBillMessage(true);
            return;
        }
        if (credit < latestBill) {
            setBillPaid(false);
            setBillPaidMessage(
                "Insufficient credit, please top up your credit to pay the bill"
            );
            setShowBillMessage(true);
            return;
        }
        const newCredit = Math.round(credit - latestBill, 2);
        try {
            user.user.balance = newCredit;
            data.reading[reading_id].status = "paid";
            await axios.put(`/api/users/${user.user.customer_id}`, user.user);
            await axios.put(
                `/api/reading/${user.user.customer_id}/${reading_id}`,
                data.reading[reading_id]
            );
            localStorage.setItem("user", JSON.stringify(user));
            setShowBillMessage(true);
            setLatestUnpaidBillAmount("No pending bills");
            setBillPaid(true);
            setBillPaidMessage("Bill Paid Successfully");
        } catch (error) {
            setShowBillMessage(true);
            setBillPaid(false);
            setBillPaidMessage(
                "Some Error Occurred, while paying the bill, please try again"
            );
            user.user.balance = credit;
            data.reading[reading_id].status = "pending";
        }
    };

    const handleTopUpCredit = () => {
        // Top up the credit with the specified EVC
    };

    const showMeterReadings = async () => {
        refetch(`/api/reading/${user.user.customer_id}`);
        const readingData = await data.reading;

        if (readingData) {
            meterReadings.push(
                Object.keys(readingData[1]).map((key) => {
                    if (key === "submission_date") {
                        return "Date";
                    } else if (key === "electricity_meter_reading_day") {
                        return "Electricity Reading Day (kWh)";
                    } else if (key === "electricity_meter_reading_night") {
                        return "Electricity Reading Night (kWh)";
                    } else if (key === "gas_meter_reading") {
                        return "Gas Reading (kWh)";
                    } else if (key === "status") {
                        return "Status";
                    } else {
                        const string = key.replace(/_/g, " ");
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }
                })
            );
            for (const reading of readingData) {
                if (reading && !meterReadings.includes(reading)) {
                    meterReadings.push(Object.values(reading));
                }
            }
            setShowMeterReadingsTable(showMeterReadingsTable ? false : true);
            showMeterReadingsTable = !showMeterReadingsTable;
            if (!showMeterReadingsTable) {
                meterReadings.length = 0;
            }
        }
    };

    const showTariffCharges = async () => {
        // const resData = (await axios.get("/api/tariff")).data.tariffs;
        const resData = (await tariff).data.tariffs;
        tariffData.push(Object.keys(resData));
        tariffData.push([]);
        for (const tariff of Object.values(resData)) {
            tariffData[1].push(tariff.rate);
        }
        console.log(tariffData);
        setShowTariffChargesTable(showTariffChargesTable ? false : true);
        showTariffChargesTable = !showTariffChargesTable;
        if (!showTariffChargesTable) {
            tariffData.length = 0;
        }
    };

    useEffect(() => {
        calcLatestBill();
        localStorage.setItem("user", JSON.stringify(user));
    });

    return user && user.user.type === "customer" ? (
        <ThemeProvider theme={theme}>
            <Grid
                container
                component="main"
                sx={{ height: "100vh" }}
                onLoad={calcLatestBill}
            >
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
                                            {errorMessage.replace(
                                                /\\n/g,
                                                "<br />"
                                            )}
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
                                gap: 2,
                            }}
                        >
                            <Typography component="h1" variant="h3">
                                Pay Latest Bill
                            </Typography>
                            {showBillMessage && billPaid ? (
                                <Collapse in={showBillMessage}>
                                    <Alert
                                        severity="success"
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setShowBillMessage(false);
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                    >
                                        {billPaidMessage}
                                    </Alert>
                                </Collapse>
                            ) : (
                                <Collapse in={showBillMessage}>
                                    <Alert
                                        severity="error"
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setShowBillMessage(false);
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                    >
                                        {billPaidMessage}
                                    </Alert>
                                </Collapse>
                            )}
                            <Typography component="p">
                                Latest Unpaid Bill Amount:{" "}
                                <strong>
                                    {latestUnpaidBillAmount === 0
                                        ? "No Bills Due"
                                        : "£" + latestUnpaidBillAmount}
                                </strong>
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
                            mt: 4,
                        }}
                    >
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
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
                                onClick={showMeterReadings}
                            >
                                {showMeterReadingsTable ? "Close" : "View"}{" "}
                                Previous Meter Readings
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                variant="contained"
                                color="purple"
                                onClick={showTariffCharges}
                            >
                                {showTariffChargesTable ? "Close" : "View"}{" "}
                                Current Tariff Charges
                            </Button>
                        </Box>
                    </Grid>
                    {showMeterReadingsTable && (
                        <Grid
                            item
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 4,
                            }}
                        >
                            {meterReadings.length > 0 ? (
                                <>
                                    <Typography component="h1" variant="h3">
                                        Previous Meter Readings
                                    </Typography>
                                    <Chart
                                        width={"100%"}
                                        height={"100%"}
                                        chartType="Table"
                                        data={Array.from(meterReadings)}
                                        options={{ title: "Meter Readings" }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            color: "black",
                                            marginBottom: "3rem",
                                        }}
                                    />
                                </>
                            ) : (
                                <Typography component="h1" variant="h6">
                                    No Previous Meter Readings
                                </Typography>
                            )}
                        </Grid>
                    )}
                    {showTariffChargesTable && (
                        <Grid
                            item
                            xs={12}
                            x
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 4,
                            }}
                        >
                            {tariffData.length > 0 ? (
                                <>
                                    <Typography component="h1" variant="h3">
                                        Current Tariff Charges
                                    </Typography>
                                    <Chart
                                        width={"100%"}
                                        height={"100%"}
                                        chartType="Table"
                                        data={tariffData}
                                        options={{ title: "Tariff Charges" }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            color: "black",
                                            marginLeft: "auto",
                                            marginBottom: "3rem",
                                        }}
                                    />
                                </>
                            ) : (
                                <Typography component="h1" variant="h6">
                                    No Tariff Charges Available Yet
                                </Typography>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : user?.user?.type === "admin" ? (
        <Navigate to="/admin/home" />
    ) : (
        <Navigate to="/login" />
    );
}
