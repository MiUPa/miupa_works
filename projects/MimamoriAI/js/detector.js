/**
 * 物体検出を管理するクラス
 */
class ObjectDetector {
    constructor() {
        this.model = null;
        this.isRunning = false;
        this.detectionInterval = null;
    }

    /**
     * モデルを読み込む
     * @returns {Promise} モデルの読み込み完了を示すPromise
     */
    async loadModel() {
        try {
            this.model = await cocoSsd.load();
            return true;
        } catch (error) {
            console.error('モデルの読み込みに失敗:', error);
            throw error;
        }
    }

    /**
     * 物体検出を実行
     * @param {HTMLVideoElement} videoElement - 検出対象の動画要素
     * @param {Function} callback - 検出結果を受け取るコールバック関数
     */
    startDetection(videoElement, callback) {
        if (!this.model) {
            throw new Error('モデルが読み込まれていません');
        }

        this.isRunning = true;
        this.detectionInterval = setInterval(async () => {
            if (!this.isRunning) return;

            try {
                const predictions = await this.model.detect(videoElement);
                const filteredPredictions = predictions.filter(
                    pred => pred.score >= CONFIG.detection.minScore
                );
                callback(filteredPredictions);
            } catch (error) {
                console.error('検出エラー:', error);
                this.stopDetection();
                throw error;
            }
        }, CONFIG.detection.interval);
    }

    /**
     * 物体検出を停止
     */
    stopDetection() {
        this.isRunning = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
} 