console.log('script.js が読み込まれました');

function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (file) {
        console.log('CSVファイルが選択されました:', file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            console.log('CSVの内容:', text.substring(0, 200) + '...'); // 最初の200文字を表示
            const orders = parseCSV(text);
            console.log('パース結果:', orders);
            updateDataTable(orders);
        };
        reader.readAsText(file);
    } else {
        console.error('ファイルが選択されていません');
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // ヘッダーのインデックスを取得
    const orderIdIndex = headers.findIndex(h => h === 'order_id');
    const postalCodeIndex = headers.findIndex(h => h === 'shipping_postal_code');
    const stateIndex = headers.findIndex(h => h === 'shipping_state');
    const cityIndex = headers.findIndex(h => h === 'shipping_city');
    const address1Index = headers.findIndex(h => h === 'shipping_address_1');
    const address2Index = headers.findIndex(h => h === 'shipping_address_2');
    const nameIndex = headers.findIndex(h => h === 'shipping_name');
    
    // ヘッダー行を除いたデータ行を処理
    const orders = lines.slice(1).filter(line => line.trim()).map(line => {
        const orderData = line.split(',');
        // ダブルクォーテーションを除去する関数
        const removeQuotes = (str) => str.replace(/^"|"$/g, '');
        
        // 住所を結合
        const fullAddress = [
            removeQuotes(orderData[stateIndex]),
            removeQuotes(orderData[cityIndex]),
            removeQuotes(orderData[address1Index]),
            removeQuotes(orderData[address2Index])
        ].filter(Boolean).join('');
        
        return {
            orderId: removeQuotes(orderData[orderIdIndex]),
            postalCode: removeQuotes(orderData[postalCodeIndex]),
            address: fullAddress,
            name: removeQuotes(orderData[nameIndex])
        };
    });
    
    return orders;
}

function updateDataTable(orders) {
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = ''; // テーブルをクリア
    
    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.postalCode}</td>
            <td>${order.address}</td>
            <td>${order.name}</td>
            <td>
                <button onclick="printSingleLabel(${index})">印刷</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // グローバル変数に保存（印刷時に使用）
    window.orderData = orders;
}

function printSingleLabel(index) {
    const order = window.orderData[index];
    updateEnvelopePreview(order);
    window.print();
}

function updateEnvelopePreview(data) {
    console.log('プレビュー更新:', data);
    document.getElementById('recipientPostal').textContent = `〒 ${data.postalCode}`;
    document.getElementById('recipientAddress').textContent = data.address;
    document.getElementById('recipientName').textContent = `${data.name} 様`;
}

// 差出人情報の読み込み
function loadSenderInfo() {
    try {
        const senderOrganization = document.getElementById('senderOrganization');
        const senderName = document.getElementById('senderName');
        const senderPostal = document.getElementById('senderPostal');
        const senderAddress = document.getElementById('senderAddress');
        const senderWebsite = document.getElementById('senderWebsite');

        if (senderOrganization && senderName && senderPostal && senderAddress && senderWebsite) {
            senderOrganization.textContent = config.sender.organization;
            senderName.textContent = config.sender.name;
            senderPostal.textContent = `〒 ${config.sender.postalCode}`;
            senderAddress.textContent = config.sender.address;
            senderWebsite.textContent = config.sender.website;
        }
    } catch (error) {
        console.error('差出人情報の読み込みに失敗しました:', error);
    }
}

// 即時実行して確実に読み込
loadSenderInfo();
document.addEventListener('DOMContentLoaded', loadSenderInfo);