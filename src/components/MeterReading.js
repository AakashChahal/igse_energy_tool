import { Chart } from "react-google-charts";
import React from "react";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "react-spinkit";

function MeterReading() {
    const navigate = useNavigate();
    const { user } = React.useContext(AuthContext);
    const { data, dataLoading, dataError, refetch } = useFetch(
        `/api/reading/${user.user.customer_id}`
    );

    return (
        <div className="meter-reading">
            <h1>Meter Reading</h1>
            <Chart
                width={"100%"}
                height={"100%"}
                chartType="Table"
                data={data}
                options={{ title: "Meter Reading" }}
            />
        </div>
    );
}

export default MeterReading;
