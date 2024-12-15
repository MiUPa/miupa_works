console.log('script.js が読み込まれました');

// 開発モードフラグ
const isDevelopment = true;  // 開発中はtrue（ダイアログを表示しない）、本番環境ではfalseに変更

// 開発モード時のダミーデータ読み込み
if (isDevelopment) {
    fetch('csv/dummy_data.csv')
        .then(response => response.text())
        .then(text => {
            const orders = parseCSV(text);
            updateDataTable(orders);
        })
        .catch(error => console.error('ダミーデータの読み込みに失敗しました:', error));
}

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
    const senderInfo = getSenderInfo();
    if (!senderInfo) return null;

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
                <p id="senderOrganization">${senderInfo.organization}</p>
                <p id="senderName">${senderInfo.name}</p>
                <p id="senderPostal">〒 ${formatPostalCode(senderInfo.postalCode)}</p>
                <p id="senderAddress">${senderInfo.address}</p>
                <p id="senderWebsite">${senderInfo.website}</p>
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

    const printArea = document.getElementById('printArea');
    printArea.innerHTML = '';

    checkboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        const order = window.orderData[index];
        const envelope = createEnvelopePreview(order);
        printArea.appendChild(envelope);
    });

    if (!isDevelopment) {
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
    }

    window.print();
}

// 送り主情報を直接フォームから取得
function getSenderInfo() {
    const organization = document.getElementById('organization').value;
    const name = document.getElementById('name').value;
    const postalCode = document.getElementById('postalCode').value;
    const address = document.getElementById('address').value;
    const website = document.getElementById('website').value;

    if (!organization || !name || !postalCode || !address) {
        alert('送り主情報を入力してください。\n\n必須項目：\n- 店舗名・組織名\n- お名前\n- 郵便番号\n- 住所');
        return null;
    }

    return {
        organization,
        name,
        postalCode,
        address,
        website
    };
}

// LocalStorageから前回の入力値を読み込む
function loadSenderInfo() {
    try {
        const savedInfo = localStorage.getItem('senderInfo');
        if (savedInfo) {
            const senderInfo = JSON.parse(savedInfo);
            document.getElementById('organization').value = senderInfo.organization || '';
            document.getElementById('name').value = senderInfo.name || '';
            document.getElementById('postalCode').value = senderInfo.postalCode || '';
            document.getElementById('address').value = senderInfo.address || '';
            document.getElementById('website').value = senderInfo.website || '';
        }
    } catch (error) {
        console.error('送り主情報の読み込みに失敗しました:', error);
    }
}

// フォームの値が変更されたら自動保存
function setupAutoSave() {
    const inputs = document.querySelectorAll('.sender-form input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const senderInfo = {
                organization: document.getElementById('organization').value,
                name: document.getElementById('name').value,
                postalCode: document.getElementById('postalCode').value,
                address: document.getElementById('address').value,
                website: document.getElementById('website').value
            };
            localStorage.setItem('senderInfo', JSON.stringify(senderInfo));
        });
    });
}

// 初期設定
document.addEventListener('DOMContentLoaded', () => {
    loadSenderInfo();
    setupAutoSave();
});