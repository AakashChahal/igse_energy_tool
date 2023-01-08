import { Chart } from "react-google-charts";
import React from "react";

function MeterReading() {
    const data = {};
    return (
        <Chart
            width={"100%"}
            height={"100%"}
            chartType="LineChart"
            loader={<div>Loading Chart</div>}
            data={[1, 2, 4]}
            options={{ title: "Meter Reading" }}
        />
    );
}

export default MeterReading;
