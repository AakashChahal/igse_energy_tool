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
    Card,
    CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { deepPurple, cyan, teal } from "@mui/material/colors";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { Chart } from "react-google-charts";
import "./payment.css";
import validator from "validator";
import { QrCodeScanner } from "@mui/icons-material";
import QrScanner from "./QrScanner";

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
    const [showPaymentPage, setShowPaymentPage] = React.useState(false);
    const [cardMessage, setCardMessage] = React.useState("");

    const [voucherMessage, setVoucherMessage] = React.useState("");
    const [showVoucherMessage, setShowVoucherMessage] = React.useState(false);

    const [toggleScanner, setToggleScanner] = React.useState(false);

    let { data, refetch } = useFetch(`/api/reading/${user.user.customer_id}`);
    let reading_id = 0;
    const tariff = axios.get("/api/tariff");

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

    const handlePayLatestBillCard = async (event) => {
        const latestBill = latestUnpaidBillAmount;
        const cardNumber = document.getElementById("cardNumber");
        const expiryDate = document.getElementById("expDate");
        const cvv = document.getElementById("cvv");
        if (typeof latestBill === "string" || latestBill === 0) {
            setShowPaymentPage(false);
            setBillPaid(false);
            setBillPaidMessage("No pending bills");
            setShowBillMessage(true);
            return;
        } else if (
            cardNumber.value === "" ||
            expiryDate.value === "" ||
            cvv.value === ""
        ) {
            return;
        } else if (!validator.isCreditCard(cardNumber.value)) {
            console.log(cardNumber.value);
        } else if (expiryDate.value.length !== 5) {
            console.log(expiryDate.value);
        }
        try {
            data.reading[reading_id].status = "paid";
            await axios.put(
                `/api/reading/${user.user.customer_id}/${reading_id}`,
                data.reading[reading_id]
            );
            setCardMessage("Payment Successful");
            setTimeout(() => {
                setShowPaymentPage(false);
                setCardMessage("");
                setLatestUnpaidBillAmount("No pending bills");
                setBillPaid(true);
                setBillPaidMessage("Bill Paid Successfully");
            }, 2000);
        } catch (error) {
            setShowBillMessage(true);
            setBillPaid(false);
            setBillPaidMessage(
                "Some Error Occurred, while paying the bill, please try again"
            );
            data.reading[reading_id].status = "pending";
        }
    };

    const handleTopUpCredit = async () => {
        if (evc === "") {
            setShowVoucherMessage(true);
            setTimeout(() => {
                setShowVoucherMessage(false);
            }, 2000);
            setVoucherMessage("Please enter a voucher code");
            return;
        }
        try {
            await axios.post("/api/evc/verify", {
                evc: evc,
            });
            await axios.post("/api/evc/use", {
                evc: evc,
            });
            setShowVoucherMessage(true);
            setTimeout(() => {
                setShowVoucherMessage(false);
            }, 2000);
            setVoucherMessage("Voucher Redeemed Successfully");
            user.user.balance = user.user.balance + 200;
            await axios.put(`/api/users/${user.user.customer_id}`, user.user);
            localStorage.setItem("user", JSON.stringify(user));
            setEVC("");
        } catch (err) {
            setShowVoucherMessage(true);
            setTimeout(() => {
                setShowVoucherMessage(false);
            }, 2000);
            setVoucherMessage(err.response.data.message);
        }
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

    const setQrData = (data) => {
        setEVC(data);
        document.getElementById("evc").focus();
    };

    const closeQRScanner = () => {
        setToggleScanner(false);
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
                {showPaymentPage && (
                    <Collapse in={showPaymentPage}>
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Card className={"card"}>
                                {cardMessage && (
                                    <Alert
                                        severity="success"
                                        sx={{
                                            width: "100%",
                                            textAlign: "center",
                                            position: "absolute",
                                            top: 0,
                                        }}
                                    >
                                        {cardMessage}
                                    </Alert>
                                )}
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        right: 5,
                                        top: 5,
                                    }}
                                    onClick={() => {
                                        setShowPaymentPage(false);
                                    }}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{ textAlign: "center" }}
                                    >
                                        Pay your bill
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{ textAlign: "center" }}
                                    >
                                        Your Bill Amount: £
                                        {latestUnpaidBillAmount}
                                    </Typography>

                                    <FormControl
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "30rem",
                                        }}
                                    >
                                        <TextField
                                            label="Full Name"
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="Card number"
                                            id="cardNumber"
                                            fullWidth
                                            margin="normal"
                                            placeholder="xxxx xxxx xxxx xxxx"
                                        />
                                        <Grid
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <TextField
                                                label="Expiration date"
                                                margin="normal"
                                                id="expDate"
                                                placeholder="MM/YY"
                                                width="45%"
                                                onKeyDown={(e) => {
                                                    if (e.key === "/") {
                                                        e.preventDefault();
                                                    } else if (
                                                        e.key === "Backspace" ||
                                                        e.key === "Delete" ||
                                                        e.key === "ArrowLeft" ||
                                                        e.key === "ArrowRight"
                                                    ) {
                                                        return;
                                                    } else if (
                                                        e.key.match(/[a-zA-Z]/)
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    if (
                                                        date.length === 2 &&
                                                        !date.includes("/")
                                                    ) {
                                                        e.target.value =
                                                            date + "/";
                                                    } else if (
                                                        date.length === 3
                                                    ) {
                                                        e.target.value =
                                                            date.slice(0, 2);
                                                    } else if (
                                                        date.length > 5
                                                    ) {
                                                        e.target.value =
                                                            date.slice(0, 5);
                                                    }
                                                }}
                                            />
                                            <TextField
                                                label="Security code"
                                                margin="normal"
                                                id="cvv"
                                                placeholder="xxx"
                                                width="45%"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Backspace" ||
                                                        e.key === "Delete" ||
                                                        e.key === "ArrowLeft" ||
                                                        e.key === "ArrowRight"
                                                    ) {
                                                        return;
                                                    } else if (
                                                        e.key.match(/[a-zA-Z]/)
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const cvv = e.target.value;
                                                    if (cvv.length > 3) {
                                                        e.target.value =
                                                            cvv.slice(0, 3);
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={handlePayLatestBillCard}
                                        >
                                            Pay
                                        </Button>
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </Box>
                    </Collapse>
                )}
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
                    className={showPaymentPage ? "blur" : ""}
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
                            <Box
                                sx={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    gap: 2,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handlePayLatestBill}
                                >
                                    Pay Using Credit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                        setShowPaymentPage(!showPaymentPage)
                                    }
                                >
                                    Pay Using Card
                                </Button>
                            </Box>
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
                            {showVoucherMessage && (
                                <Collapse in={showVoucherMessage}>
                                    <Alert
                                        severity="info"
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setShowVoucherMessage(
                                                        false
                                                    );
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                    >
                                        {voucherMessage}
                                    </Alert>
                                </Collapse>
                            )}
                            <Grid item>
                                <TextField
                                    id="evc"
                                    label="EVC"
                                    value={evc}
                                    onChange={(event) =>
                                        setEVC(event.target.value)
                                    }
                                    InputLabelProps={
                                        document.getElementById("evc")?.value
                                            ?.length > 0
                                            ? { shrink: true }
                                            : {}
                                    }
                                />
                                <QrCodeScanner
                                    sx={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 2,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setToggleScanner(!toggleScanner);
                                    }}
                                />
                                {toggleScanner && (
                                    <QrScanner
                                        handleClose={closeQRScanner}
                                        setQrData={setQrData}
                                    />
                                )}
                            </Grid>
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
