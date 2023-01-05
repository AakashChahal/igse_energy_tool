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

const theme = createTheme((theme) => ({
    palette: {
        mode: "dark",
    },
    root: {
        flexGrow: 1,
    },
    priceSettingForm: {
        "& > *": {
            margin: theme.spacing(1),
            width: "120px",
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
    const [standingCharge, setStandingCharge] = React.useState("");

    // eslint-disable-next-line
    const [meterReadings, setMeterReadings] = React.useState([]);
    const [averageElectricityConsumption, setAverageElectricityConsumption] =
        React.useState("");
    const [averageGasConsumption, setAverageGasConsumption] =
        React.useState("");

    const [errorCreatingTariff, setErrorCreatingTariff] = React.useState(false);
    const [successCreatingTariff, setSuccessCreatingTariff] =
        React.useState(false);
    const [open, setOpen] = React.useState(true);

    const { user } = React.useContext(AuthContext);

    // const { data, dataError, dataLoading, refetch } = useFetch("/api/reading");
    // console.log(data);
    const handleSubmitPrices = async (event) => {
        event.preventDefault();
        const priceData = {
            electricity_day: electricityPriceDay,
            electricity_night: electricityPriceNight,
            standing: standingCharge,
            gas: gasPrice,
        };

        let update = false;

        for (const key in priceData) {
            if (priceData[key] === "") {
                update = true;
                break;
            }
        }

        try {
            if (update) {
                const res = await axios.post("/api/tariff", priceData);
            } else {
                const res = await axios.put("/api/tariff", priceData);
            }
            setElectricityPriceDay("");
            setElectricityPriceNight("");
            setStandingCharge("");
            setGasPrice("");
            setOpen(true);
            setErrorCreatingTariff(false);
            setSuccessCreatingTariff(true);
        } catch (error) {
            console.log(error);
            setOpen(true);
            setErrorCreatingTariff(true);
            setSuccessCreatingTariff(false);
        }
    };

    const handleFetchMeterReadings = () => {
        // Fetch the meter readings from the server and set them in the state
        // if (data) {
        //     for (const key in data.readings) {
        //         for (const readings in data.readings[key][1]) {
        //             readingsData[0].push(readings);
        //             readingsData[1].push(data.readings[key][1][readings]);
        //         }
        //     }
        //     console.log(readingsData);
        // }
    };

    const handleFetchStatistics = () => {
        // Fetch the energy statistics from the server and set them in the state
        // if (data) {
        //     setAverageElectricityConsumption(true);
        //     setAverageGasConsumption(true);
        //     for (const key in data.readings.aakash_second[1]) {
        //         if (
        //             key === "elec_reading_day" ||
        //             key === "elec_reading_night" ||
        //             key === "gas"
        //         ) {
        //             consumptionData.push([
        //                 key,
        //                 data.readings.aakash_second[1][key],
        //             ]);
        //         }
        //     }
        //     console.log(consumptionData);
        // }
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
                        mt: "auto",
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
                                        Error Creating/Updating the Tariff,
                                        Please try again
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
                        {averageElectricityConsumption && (
                            <div>
                                <p>Average Electricity Consumption:</p>
                                <p>{averageElectricityConsumption}</p>
                            </div>
                        )}
                        {averageGasConsumption && (
                            <div>
                                <p>Average Gas Consumption:</p>
                                <p>{averageGasConsumption}</p>
                            </div>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleFetchMeterReadings}
                        >
                            Fetch Meter Readings
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleFetchMeterReadings}
                        >
                            View Tariff Prices
                        </Button>
                        {/* {dataLoading ? (
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
                        )} */}
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    ) : user.user.type === "customer" ? (
        <Navigate to="/dashboard" />
    ) : (
        <Navigate to="/login" />
    );
}

export default AdminHomePage;
