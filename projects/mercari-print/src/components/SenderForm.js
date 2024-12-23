// src/components/SenderForm.js
import React, { useState } from 'react';

const SenderForm = () => {
    const [organization, setOrganization] = useState('');
    const [name, setName] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');

    // フォームの送信処理やCSVの処理をここに追加

    return (
        <div className="sender-form">
            <h2>送り主情報の設定</h2>
            <div className="form-group">
                <label>店舗名・組織名:</label>
                <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>お名前:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>郵便番号:</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="000-0000" required />
            </div>
            <div className="form-group">
                <label>住所:</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>ウェブサイトURL:</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
        </div>
    );
};

export default SenderForm;