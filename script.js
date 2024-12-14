function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            updateEnvelopePreview(data);
        };
        reader.readAsText(file);
  
  }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const orderData = lines[1].split(',');
    
    // メルカリShopsのCSVヘッダーから必要な列のインデックスを取得
    const postalCodeIndex = headers.findIndex(h => h === 'shipping_postal_code');
    const stateIndex = headers.findIndex(h => h === 'shipping_state');
    const cityIndex = headers.findIndex(h => h === 'shipping_city');
    const address1Index = headers.findIndex(h => h === 'shipping_address_1');
    const address2Index = headers.findIndex(h => h === 'shipping_address_2');
    const nameIndex = headers.findIndex(h => h === 'shipping_name');
    
    if ([postalCodeIndex, stateIndex, cityIndex, address1Index, nameIndex].includes(-1)) {
        throw new Error('CSVファイルのフォーマットが正しくありません');
    }
    
    // ダブルクォーテーションを除去する関数
    const removeQuotes = (str) => str.replace(/^"|"$/g, '');
    
    // 住所を結合（都道府県 + 市区町村 + 番地 + 建物名）
    const fullAddress = [
        removeQuotes(orderData[stateIndex]),
        removeQuotes(orderData[cityIndex]),
        removeQuotes(orderData[address1Index]),
        removeQuotes(orderData[address2Index])
    ].filter(Boolean).join('');
    
    return {
        postalCode: removeQuotes(orderData[postalCodeIndex]),
        address: fullAddress,
        name: removeQuotes(orderData[nameIndex])
    };
}
function updateEnvelopePreview(data) {
    document.getElementById('recipientPostal').textContent = `〒 ${data.postalCode}`;
    document.getElementById('recipientAddress').textContent = data.address;
    document.getElementById('recipientName').textContent = data.name;
}

function printLabel() {
    window.print();
}

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
        } else {
            console.error('差出人情報の要素が見つかりません');
        }
    } catch (error) {
        console.error('差出人情報の読み込みに失敗しました:', error);
        console.error(error);
    }
}

// 即時実行して確実に読み込む
loadSenderInfo();
// バックアップとしてDOMContentLoadedイベントでも実行
document.addEventListener('DOMContentLoaded', loadSenderInfo);