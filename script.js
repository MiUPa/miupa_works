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
    // CSVパースの実装
    // メルカリShopsのCSV形式に合わせて調整が必要
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const orderData = lines[1].split(',');
    
    return {
        postalCode: orderData[/* 郵便番号のインデックス */],
        address: orderData[/* 住所のインデックス */],
        name: orderData[/* 名前のインデックス */]
    };
}

function updateEnvelopePreview(data) {
    document.getElementById('recipientPostal').textContent = `〒${data.postalCode}`;
    document.getElementById('recipientAddress').textContent = data.address;
    document.getElementById('recipientName').textContent = data.name;
}

function printLabel() {
    window.print();
} 