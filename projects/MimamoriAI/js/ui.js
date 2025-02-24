/**
 * UI要素を管理するクラス
 */
class UI {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.statusElement = document.getElementById('status');
        this.errorElement = document.getElementById('error');
    }

    /**
     * カメラストリームを初期化
     * @returns {Promise} カメラストリームの初期化完了を示すPromise
     */
    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: CONFIG.camera
            });
            
            this.video.srcObject = stream;
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });
        } catch (error) {
            console.error('カメラの初期化に失敗:', error);
            throw error;
        }
    }

    /**
     * 検出結果を描画
     * @param {Array} predictions - 検出結果の配列
     */
    drawPredictions(predictions) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.context.strokeStyle = CONFIG.detection.colors.box;
        this.context.lineWidth = CONFIG.drawing.lineWidth;
        this.context.font = CONFIG.drawing.font;
        this.context.fillStyle = CONFIG.detection.colors.text;

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            
            // バウンディングボックスを描画
            this.context.strokeRect(x, y, width, height);
            
            // ラベルとスコアを描画
            const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            const textY = y > 10 ? y - 5 : 10;
            this.context.fillText(label, x, textY);
        });
    }

    /**
     * ステータスメッセージを表示
     * @param {string} message - 表示するメッセージ
     */
    showStatus(message) {
        this.statusElement.textContent = message;
        this.statusElement.style.display = 'block';
        this.errorElement.style.display = 'none';
    }

    /**
     * エラーメッセージを表示
     * @param {string} message - 表示するエラーメッセージ
     */
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.statusElement.style.display = 'none';
    }
} 