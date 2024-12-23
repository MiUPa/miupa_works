// src/components/DataTable.js
import React from 'react';

const DataTable = ({ orders }) => {
    return (
        <div className="data-preview">
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll" /></th>
                        <th>注文番号</th>
                        <th>郵便番号</th>
                        <th>住所</th>
                        <th>宛名</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={index}>
                            <td><input type="checkbox" /></td>
                            <td>{order.orderId}</td>
                            <td>{order.postalCode}</td>
                            <td>{order.address}</td>
                            <td>{order.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;