// src/App.js
import React from 'react';
import Header from './components/Header';
import SenderForm from './components/SenderForm';
import DataTable from './components/DataTable';
import Footer from './components/Footer';
import './styles.css';

const App = () => {
    const orders = []; // ここにデータを設定

    return (
        <div className="container">
            <Header />
            <SenderForm />
            <DataTable orders={orders} />
            <Footer />
        </div>
    );
};

export default App;