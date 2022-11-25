import React from "react";
import QrReader from "react-qr-scanner";

export default function QrScanner(props) {
    const handleScan = (data) => {
        if (data) {
            props.setQrData(data.text);
            props.handleClose();
        }
    };

    const handleError = (err) => {
        console.error(err);
    };

    return (
        <div className="box">
            <span className="close-icon" onClick={props.handleClose}>
                x
            </span>
            <QrReader
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%" }}
            />
        </div>
    );
}
