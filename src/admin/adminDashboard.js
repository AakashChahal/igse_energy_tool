import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import useFetch from "../hooks/useFetch";
import { Chart } from "react-google-charts";

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

export let visData = [["type", "reading"]];
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

    const { data, error, loading, refetch } = useFetch("/api/reading");
    // console.log(data);
    const handleSubmitPrices = (event) => {
        event.preventDefault();
        // Submit the new prices to the server
    };

    const handleFetchMeterReadings = () => {
        // Fetch the meter readings from the server and set them in the state
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
                    visData.push([key, data.readings.aakash_second[1][key]]);
                }
            }
            console.log(visData);
        }
    };

    return (
        <div>
            <form
                className={theme.priceSettingForm}
                onSubmit={handleSubmitPrices}
            >
                <h2 className={theme.priceSettingFormTitle}>Set Prices</h2>
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
                    id="gas-price"
                    label="Gas Price"
                    type="number"
                    value={gasPrice}
                    onChange={(event) => setGasPrice(event.target.value)}
                />
                <Button type="submit" variant="contained" color="primary">
                    Submit
                </Button>
            </form>
            <Button onClick={handleFetchMeterReadings}>
                Fetch Meter Readings
            </Button>
            {meterReadings.length > 0 && (
                <TableContainer
                    component={Paper}
                    className={theme.meterReadingTable}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Submission Date</TableCell>
                                <TableCell>Electricity (Day)</TableCell>
                                <TableCell>Electricity (Night)</TableCell>
                                <TableCell>Gas</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {meterReadings.map((reading) => (
                                <TableRow key={reading.id}>
                                    <TableCell>
                                        {reading.submissionDate}
                                    </TableCell>
                                    <TableCell>
                                        {reading.electricityMeterReadingDay}
                                    </TableCell>
                                    <TableCell>
                                        {reading.electricityMeterReadingNight}
                                    </TableCell>
                                    <TableCell>
                                        {reading.gasMeterReading}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Button onClick={handleFetchStatistics}>Fetch Statistics</Button>
            {averageElectricityConsumption && (
                <Chart
                    chartType="PieChart"
                    data={visData}
                    width="100%"
                    height="400px"
                    options={chartOptions}
                    legendToggle
                />
            )}
            {averageGasConsumption && (
                <div className={theme.statisticsSection}>
                    <p>Average Gas Consumption:</p>
                    <p className={theme.statisticsValue}>
                        {averageGasConsumption}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AdminHomePage;
