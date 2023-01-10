import axios from "axios";
import { useState, useEffect } from "react";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const response = await axios.get(url);
                setData(response.data);
            } catch (error) {
                setDataError(error);
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [url]);
    const refetch = async (url) => {
        setDataLoading(true);
        try {
            const response = await axios.get(url);
            setData(response.data);
        } catch (error) {
            setDataError(error);
        } finally {
            setDataLoading(false);
        }
    };

    return { data, dataLoading, dataError, refetch };
};

export default useFetch;
