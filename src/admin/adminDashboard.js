import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    TextField,
    Button,
    Typography,
    FormControl,
    Grid,
    CssBaseline,
    Alert,
    IconButton,
    Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useFetch from "../hooks/useFetch";
import { Chart } from "react-google-charts";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";

const theme = createTheme({
    palette: {
        mode: "dark",
    },
    root: {
        flexGrow: 1,
    },
});

export let consumptionData = [];
export let avgGasPerUser = [];
export let avgElectricityPerUser = [];
export const readingsData = [];
export const tariffData = [];

function AdminHomePage() {
    const [electricityPriceDay, setElectricityPriceDay] = React.useState("");
    const [electricityPriceNight, setElectricityPriceNight] =
        React.useState("");
    const [gasPrice, setGasPrice] = React.useState("");
    const [standingCharge, setStandingCharge] = React.useState("");
    const [showMeterReadings, setShowMeterReadings] = React.useState(false);
    let [showTariffTable, setShowTariffTable] = React.useState(false);
    let [showStatistics, setShowStatistics] = React.useState(false);
    let [
        averageElectricityConsumptionNight,
        setAverageElectricityConsumptionNight,
    ] = React.useState(0);
    let [
        averageElectricityConsumptionDay,
        setAverageElectricityConsumptionDay,
    ] = React.useState(0);
    let [averageGasConsumption, setAverageGasConsumption] = React.useState(0);
    const [readingMessage, setReadingMessage] = React.useState("");

    const [errorCreatingTariff, setErrorCreatingTariff] = React.useState(false);
    const [successCreatingTariff, setSuccessCreatingTariff] =
        React.useState(false);
    const [open, setOpen] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState("");

    const { user } = React.useContext(AuthContext);

    const { data, dataError, dataLoading } = useFetch("/api/reading");

    const handleSubmitPrices = async (event) => {
        event.preventDefault();
        const priceData = {
            electricity_day: electricityPriceDay,
            electricity_night: electricityPriceNight,
            standing: standingCharge,
            gas: gasPrice,
        };

        let update = false;
        let count = 0;
        if (
            priceData.electricity_day === "" &&
            priceData.electricity_night === "" &&
            priceData.standing === "" &&
            priceData.gas === ""
        ) {
            setOpen(true);
            setErrorCreatingTariff(true);
            setSuccessCreatingTariff(false);
            setErrorMessage("Please enter at least one price");
            return;
        }
        for (const key in priceData) {
            if (priceData[key] === "") {
                update = true;
                count += 1;
            }
        }
        if (count === 4) {
            setOpen(true);
            setErrorCreatingTariff(false);
            setSuccessCreatingTariff(true);
            return;
        }

        try {
            if (update) {
                await axios.put("/api/tariff", priceData);
            } else {
                await axios.post("/api/tariff", priceData);
            }
            setElectricityPriceDay("");
            setElectricityPriceNight("");
            setStandingCharge("");
            setGasPrice("");
            setOpen(true);
            setErrorCreatingTariff(false);
            setSuccessCreatingTariff(true);
        } catch (error) {
            setOpen(true);
            setErrorCreatingTariff(true);
            setSuccessCreatingTariff(false);
            setErrorMessage(
                "Error Creating/Updating the Tariff, Please try again"
            );
        }
    };

    const handleFetchMeterReadings = async () => {
        setShowTariffTable(false);
        setShowStatistics(false);
        setAverageElectricityConsumptionDay(0);
        setAverageElectricityConsumptionNight(0);
        setAverageGasConsumption(0);
        consumptionData.length = 0;
        avgGasPerUser.length = 0;
        avgElectricityPerUser.length = 0;
        tariffData.length = 0;
        if (dataError) {
            setReadingMessage("Error fetching meter readings, try again later");
            return;
        } else if (dataLoading) {
            setReadingMessage("Loading meter readings...");
        }
        const readingData = await data.readings;
        setShowMeterReadings(!showMeterReadings);
        if (!showMeterReadings) {
            readingsData.length = 0;
        }

        if (readingData) {
            readingsData.push(
                Object.keys(Object.values(readingData)[0][1]).map((key) => {
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
            for (const user of Object.values(readingData)) {
                for (const reading of user) {
                    if (reading) {
                        readingsData.push([...Object.values(reading)]);
                    }
                }
            }
        }
    };

    const handleFetchTariff = async () => {
        setShowMeterReadings(false);
        setShowStatistics(false);
        setAverageElectricityConsumptionDay(0);
        setAverageElectricityConsumptionNight(0);
        setAverageGasConsumption(0);
        consumptionData.length = 0;
        avgGasPerUser.length = 0;
        avgElectricityPerUser.length = 0;
        tariffData.length = 0;
        const resData = (await axios.get("/api/tariff")).data.tariffs;
        tariffData.push(Object.keys(resData));
        tariffData.push([]);
        for (const tariff of Object.values(resData)) {
            tariffData[1].push("£" + tariff.rate);
        }
        setShowTariffTable(!showTariffTable);
        showTariffTable = !showTariffTable;
        if (!showTariffTable) {
            tariffData.length = 0;
        }
    };

    const handleFetchStatistics = async () => {
        setShowMeterReadings(false);
        setShowTariffTable(false);
        setAverageElectricityConsumptionDay(0);
        setAverageElectricityConsumptionNight(0);
        setAverageGasConsumption(0);
        consumptionData.length = 0;
        tariffData.length = 0;
        consumptionData.push(["Type", "Consumption"]);
        avgGasPerUser.push(["User (customer_id)", "Average Gas Consumption"]);
        avgElectricityPerUser.push([
            "User (customer_id)",
            "Average Electricity Consumption",
        ]);
        // Fetch the energy statistics from the server and set them in the state
        try {
            const res = await axios.get("/api/stats");
            if (res) {
                for (const type of Object.keys(res.data)) {
                    if (type === "day") {
                        setAverageElectricityConsumptionDay(
                            averageElectricityConsumptionDay + res.data[type]
                        );
                        averageElectricityConsumptionDay += res.data[type];
                    } else if (type === "night") {
                        setAverageElectricityConsumptionNight(
                            averageElectricityConsumptionNight + res.data[type]
                        );
                        averageElectricityConsumptionNight += res.data[type];
                    } else {
                        setAverageGasConsumption(
                            averageGasConsumption + res.data[type]
                        );
                        averageGasConsumption += res.data[type];
                    }
                }
                consumptionData.push([
                    "electricity_day",
                    averageElectricityConsumptionDay,
                ]);
                consumptionData.push([
                    "electricity_night",
                    averageElectricityConsumptionNight,
                ]);
                consumptionData.push(["gas", averageGasConsumption]);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            const res = await axios.get("/api/stats/perUser");
            if (res) {
                for (const user of Object.keys(res.data)) {
                    for (const type of Object.keys(res.data[user])) {
                        if (type === "electricity") {
                            avgElectricityPerUser.push([
                                user,
                                Math.round(res.data[user][type] / 31),
                            ]);
                        } else {
                            avgGasPerUser.push([
                                user,
                                Math.round(res.data[user][type] / 31),
                            ]);
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
        setShowStatistics(!showStatistics);
        showStatistics = !showStatistics;

        if (!showStatistics) {
            consumptionData.length = 0;
            avgGasPerUser.length = 0;
            avgElectricityPerUser.length = 0;
        }
    };

    return user && user.user.type === "admin" ? (
        <ThemeProvider theme={theme}>
            <Grid
                container
                component="main"
                sx={{ height: "100vh", width: "100vw" }}
            >
                <Navbar />
                <CssBaseline />
                <Grid
                    item
                    xs={12}
                    sx={{
                        alignItems: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        mt: "5rem",
                        mb: "auto",
                        minWidth: "300px",
                    }}
                >
                    <Grid
                        item
                        xs={12}
                        component="form"
                        sx={{
                            gap: "1rem",
                            mb: "2rem",
                        }}
                    >
                        <FormControl
                            sx={{
                                gap: "1rem",
                            }}
                        >
                            <Typography component={"h1"} variant={"h2"}>
                                Set Tariff Prices
                            </Typography>
                            {errorCreatingTariff && (
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
                            {successCreatingTariff && (
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
                                        Tariff created/updated successfully
                                    </Alert>
                                </Collapse>
                            )}
                            <TextField
                                id="electricity-price-day"
                                label="Electricity Price (Day)"
                                type="number"
                                value={electricityPriceDay}
                                onChange={(event) =>
                                    setElectricityPriceDay(event.target.value)
                                }
                            />
                            <TextField
                                id="electricity-price-night"
                                label="Electricity Price (Night)"
                                type="number"
                                value={electricityPriceNight}
                                onChange={(event) =>
                                    setElectricityPriceNight(event.target.value)
                                }
                            />
                            <TextField
                                id="standing-charge"
                                label="Standing Charge"
                                type="number"
                                value={standingCharge}
                                onChange={(event) =>
                                    setStandingCharge(event.target.value)
                                }
                            />
                            <TextField
                                id="gas-price"
                                label="Gas Price"
                                type="number"
                                value={gasPrice}
                                onChange={(event) =>
                                    setGasPrice(event.target.value)
                                }
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                onClick={handleSubmitPrices}
                            >
                                Submit
                            </Button>
                        </FormControl>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "1rem",
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleFetchStatistics}
                        >
                            Fetch Statistics
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleFetchMeterReadings}
                        >
                            Fetch Meter Readings
                        </Button>
                        <Button variant="contained" onClick={handleFetchTariff}>
                            View Tariff Prices
                        </Button>
                    </Grid>
                    {showMeterReadings && readingsData.length < 1 ? (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                gap: "1rem",
                                mb: "2rem",
                                mt: "2rem",
                            }}
                        >
                            <Typography component={"h1"} variant={"h3"}>
                                No Meter Readings
                            </Typography>
                        </Grid>
                    ) : (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                gap: "1rem",
                                mb: "2rem",
                                mt: "2rem",
                                textAlign: "center",
                                mr: "auto",
                                ml: "auto",
                            }}
                        >
                            {showMeterReadings && (
                                <>
                                    <Typography component={"h1"} variant={"h3"}>
                                        Meter Readings
                                    </Typography>
                                    <Chart
                                        chartType="Table"
                                        data={readingsData}
                                        width="100%"
                                        height="400px"
                                        style={{
                                            color: "black",
                                        }}
                                        loader={readingMessage}
                                    />
                                </>
                            )}
                        </Grid>
                    )}
                    {showTariffTable && tariffData.length < 1 ? (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                gap: "1rem",
                                mb: "2rem",
                                mt: "2rem",
                            }}
                        >
                            <Typography component={"h1"} variant={"h3"}>
                                No Tariff Prices
                            </Typography>
                        </Grid>
                    ) : (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                gap: "1rem",
                                mb: "2rem",
                                textAlign: "center",
                            }}
                        >
                            {showTariffTable && (
                                <>
                                    <Typography component={"h1"} variant={"h3"}>
                                        Tariff Prices
                                    </Typography>
                                    <Chart
                                        chartType="Table"
                                        data={tariffData}
                                        minWidth={"50vw"}
                                        height={"100px"}
                                        style={{
                                            color: "black",
                                            border: "1px solid black",
                                            borderRadius: "20px",
                                        }}
                                        loader={<div>Loading Chart</div>}
                                    />
                                </>
                            )}
                        </Grid>
                    )}
                    {showStatistics && consumptionData.length < 1 ? (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                gap: "1rem",
                                mb: "2rem",
                                mt: "2rem",
                            }}
                        >
                            <Typography component={"h1"} variant={"h3"}>
                                No Statistics
                            </Typography>
                        </Grid>
                    ) : (
                        showStatistics && (
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                    mb: "2rem",
                                    textAlign: "center",
                                    mr: "auto",
                                    ml: "auto",
                                }}
                            >
                                <Typography component={"h1"} variant={"h3"}>
                                    Statistics
                                </Typography>
                                <Chart
                                    width={"70vw"}
                                    height={"400px"}
                                    chartType="PieChart"
                                    loader={<div>Loading Chart</div>}
                                    data={consumptionData}
                                    options={{
                                        title: "Overall Consumption",
                                        is3D: true,
                                    }}
                                    style={{
                                        color: "black",
                                        background: "transparent",
                                    }}
                                />
                                <Chart
                                    width={"70vw"}
                                    height={"400px"}
                                    chartType="PieChart"
                                    loader={<div>Loading Chart</div>}
                                    data={avgElectricityPerUser}
                                    options={{
                                        title: "Avg. Electricity Consumption per day",
                                        is3D: true,
                                    }}
                                    style={{
                                        color: "black",
                                        background: "transparent",
                                    }}
                                />
                                <Chart
                                    width={"70vw"}
                                    height={"400px"}
                                    chartType="PieChart"
                                    loader={<div>Loading Chart</div>}
                                    data={avgGasPerUser}
                                    options={{
                                        title: "Avg. Gas Consumption per day",
                                        is3D: true,
                                    }}
                                    style={{
                                        color: "black",
                                        background: "transparent",
                                    }}
                                />
                            </Grid>
                        )
                    )}
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : user?.user?.type === "customer" ? (
        <Navigate to="/dashboard" />
    ) : (
        <Navigate to="/login" />
    );
}

export default AdminHomePage;
