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

function formatPostalCode(code) {
    // 数字以外を除去し、3桁-4桁の形式にフォーマット
    const cleaned = code.replace(/[^\d]/g, '');
    if (cleaned.length === 7) {
        return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    }
    return code;
}

function updateDataTable(orders) {
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = '';
    
    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'order-checkbox';
        checkbox.dataset.index = index;
        checkboxCell.style.textAlign = 'center';
        checkboxCell.appendChild(checkbox);

        row.appendChild(checkboxCell);
        row.innerHTML += `
            <td>${order.orderId}</td>
            <td>${formatPostalCode(order.postalCode)}</td>
            <td>${order.address}</td>
            <td>${order.name}</td>
        `;
        tableBody.appendChild(row);
    });
    
    window.orderData = orders;
}

function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function createEnvelopePreview(order) {
    const envelope = document.createElement('div');
    envelope.className = 'envelope-preview';
    envelope.innerHTML = `
        <div class="address-section">
            <div class="recipient-address">
                <p id="recipientPostal">〒 ${formatPostalCode(order.postalCode)}</p>
                <p id="recipientAddress">${order.address}</p>
                <p id="recipientName">${order.name} 様</p>
            </div>
            <div class="sender-address">
                <p id="senderOrganization">${config.sender.organization}</p>
                <p id="senderName">${config.sender.name}</p>
                <p id="senderPostal">〒 ${formatPostalCode(config.sender.postalCode)}</p>
                <p id="senderAddress">${config.sender.address}</p>
                <p id="senderWebsite">${config.sender.website}</p>
            </div>
        </div>
    `;
    return envelope;
}

async function printSelectedLabels() {
    const checkboxes = document.querySelectorAll('.order-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('印刷する宛名ラベルを選択してください。');
        return;
    }

    const confirmed = confirm(
        `選択された ${checkboxes.length} 件の宛名ラベルを印刷します。\n\n` +
        '印刷設定を確認してください：\n' +
        '1. 用紙サイズ：A4\n' +
        '2. 印刷の向き：縦\n' +
        '3. 倍率：100%（実際のサイズ）\n' +
        '4. 余白：なし\n\n' +
        '印刷を続けますか？'
    );
    
    if (!confirmed) return;

    const printArea = document.getElementById('printArea');
    printArea.innerHTML = '';

    checkboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        const order = window.orderData[index];
        const envelope = createEnvelopePreview(order);
        printArea.appendChild(envelope);
    });

    window.print();
}

function printSingleLabel(index) {
    const order = window.orderData[index];
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = '';
    printArea.appendChild(createEnvelopePreview(order));

    const confirmed = confirm(
        '印刷���定を確認してください：\n' +
        '1. 用紙サイズ：A4\n' +
        '2. 印刷の向き：縦\n' +
        '3. 倍率：100%（実際のサイズ）\n' +
        '4. 余白：なし\n\n' +
        '印刷を続けますか？'
    );
    
    if (confirmed) {
        window.print();
    }
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