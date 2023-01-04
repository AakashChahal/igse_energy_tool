import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    TextField,
    Button,
    Typography,
    FormControl,
    Grid,
    CssBaseline,
} from "@mui/material";
import useFetch from "../hooks/useFetch";
import { Chart } from "react-google-charts";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const theme = createTheme((theme) => ({
    root: {
        flexGrow: 1,
    },
    priceSettingForm: {
        "& > *": {
            margin: theme.spacing(1),
            width: "25ch",
        },
    },
    priceSettingFormTitle: {
        margin: theme.spacing(2),
    },
    meterReadingTable: {
        margin: theme.spacing(2),
    },
    statisticsSection: {
        margin: theme.spacing(2),
    },
    statisticsValue: {
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
}));

export let consumptionData = [["type", "reading"]];
export let readingsData = [[], []];
export const chartOptions = {
    title: "Meter Readings",
    is3D: true,
};

function AdminHomePage() {
    const [electricityPriceDay, setElectricityPriceDay] = React.useState("");
    const [electricityPriceNight, setElectricityPriceNight] =
        React.useState("");
    const [gasPrice, setGasPrice] = React.useState("");
    const [meterReadings, setMeterReadings] = React.useState([]);
    const [averageElectricityConsumption, setAverageElectricityConsumption] =
        React.useState("");
    const [averageGasConsumption, setAverageGasConsumption] =
        React.useState("");

    const { user } = React.useContext(AuthContext);

    const { data, dataError, dataLoading, refetch } = useFetch("/api/reading");
    // console.log(data);
    const handleSubmitPrices = (event) => {
        event.preventDefault();
        // Submit the new prices to the server
    };

    const handleFetchMeterReadings = () => {
        // Fetch the meter readings from the server and set them in the state
        if (data) {
            for (const key in data.readings) {
                for (const readings in data.readings[key][1]) {
                    readingsData[0].push(readings);
                    readingsData[1].push(data.readings[key][1][readings]);
                }
            }
            console.log(readingsData);
        }
    };

    const handleFetchStatistics = () => {
        // Fetch the energy statistics from the server and set them in the state
        if (data) {
            setAverageElectricityConsumption(true);
            setAverageGasConsumption(true);
            for (const key in data.readings.aakash_second[1]) {
                if (
                    key === "elec_reading_day" ||
                    key === "elec_reading_night" ||
                    key === "gas"
                ) {
                    consumptionData.push([
                        key,
                        data.readings.aakash_second[1][key],
                    ]);
                }
            }
            console.log(consumptionData);
        }
    };

    return user && user.user.type === "admin" ? (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: "100vh" }}>
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
                        mt: "auto",
                    }}
                >
                    <Grid item xs={12} component="form">
                        <FormControl
                            className={theme.priceSettingForm}
                            onSubmit={handleSubmitPrices}
                        >
                            <Typography component={"h1"} variant={"h2"}>
                                Set Prices
                            </Typography>
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
                                value={electricityPriceNight}
                                onChange={(event) =>
                                    setElectricityPriceNight(event.target.value)
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
                            >
                                Submit
                            </Button>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button onClick={handleFetchStatistics}>
                            Fetch Statistics
                        </Button>
                        {averageElectricityConsumption && (
                            <div className={theme.statisticsSection}>
                                <p>Average Electricity Consumption:</p>
                                <p className={theme.statisticsValue}>
                                    {averageElectricityConsumption}
                                </p>
                            </div>
                        )}
                        {averageGasConsumption && (
                            <div className={theme.statisticsSection}>
                                <p>Average Gas Consumption:</p>
                                <p className={theme.statisticsValue}>
                                    {averageGasConsumption}
                                </p>
                            </div>
                        )}
                        <Button onClick={handleFetchMeterReadings}>
                            Fetch Meter Readings
                        </Button>
                        {dataLoading ? (
                            "loading"
                        ) : (
                            <Chart
                                chartType="Table"
                                data={readingsData}
                                width="100%"
                                height="400px"
                                options={chartOptions}
                                legendToggle
                            />
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : (
        <Navigate to="/admin/login" />
    );
}

export default AdminHomePage;
