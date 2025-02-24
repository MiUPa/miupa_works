/**
 * アプリケーションのメインクラス
 */
class App {
    constructor() {
        this.ui = new UI();
        this.detector = new ObjectDetector();
    }

    /**
     * アプリケーションを初期化して開始
     */
    async start() {
        try {
            // UIの初期化
            this.ui.showStatus('カメラを初期化しています...');
            await this.ui.initializeCamera();

            // モデルの読み込み
            this.ui.showStatus('AIモデルを読み込んでいます...');
            await this.detector.loadModel();

            // 検出の開始
            this.ui.showStatus('準備完了');
            this.detector.startDetection(this.ui.video, (predictions) => {
                this.ui.drawPredictions(predictions);
            });

            // 3秒後にステータスメッセージを非表示
            setTimeout(() => {
                this.ui.statusElement.style.display = 'none';
            }, 3000);

        } catch (error) {
            console.error('アプリケーションの初期化に失敗:', error);
            if (error.name === 'NotAllowedError') {
                this.ui.showError('カメラへのアクセスが拒否されました。カメラの使用を許可してください。');
            } else {
                this.ui.showError('エラーが発生しました。ページを再読み込みしてください。');
            }
        }
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start();
}); 