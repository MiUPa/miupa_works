/**
 * 物体検出を管理するクラス
 */
class ObjectDetector {
    constructor() {
        this.model = null;
        this.isRunning = false;
        this.detectionInterval = null;
        this.videoElement = null;
        this.detectionCallback = null;
        this.pauseDetection = false; // 検出の一時停止フラグ
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

        this.videoElement = videoElement;
        this.detectionCallback = callback;
        this.isRunning = true;
        this._startDetectionInterval();
    }

    /**
     * 検出インターバルを開始
     * @private
     */
    _startDetectionInterval() {
        // 既存のインターバルをクリア
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }

        // 検出処理を行うインターバルを設定
        this.detectionInterval = setInterval(async () => {
            if (!this.isRunning) return;
            
            // ビデオ要素が有効かチェック
            if (!this.videoElement || !this.videoElement.srcObject) {
                console.log('ビデオ要素が準備できていません');
                return;
            }
            
            // ビデオが再生中かチェック
            if (this.videoElement.paused || this.videoElement.ended) {
                console.log('ビデオが再生されていません');
                return;
            }

            try {
                // 一時停止中は検出をスキップ
                if (!this.pauseDetection) {
                    // 検出実行
                    const predictions = await this.model.detect(this.videoElement);
                    const filteredPredictions = predictions.filter(
                        pred => pred.score >= CONFIG.detection.minScore
                    );
                    
                    if (this.detectionCallback) {
                        this.detectionCallback(filteredPredictions);
                    }
                }
            } catch (error) {
                console.error('検出エラー:', error);
                // エラーが一時的な問題なら検出を停止せず、次の試行を待つ
                if (error.name === 'AbortError' || 
                    error.message.includes('video element has not loaded') ||
                    error.message.includes('timeout')) {
                    console.warn('検出が一時的に中断されました。再試行します。');
                } else {
                    this.stopDetection();
                    throw error;
                }
            }
        }, CONFIG.detection.interval);
        
        console.log('検出インターバルを開始しました');
    }

    /**
     * 物体検出を停止
     */
    stopDetection() {
        this.isRunning = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
            console.log('検出インターバルを停止しました');
        }
    }

    /**
     * カメラ状態の変更に対応
     * @param {boolean} isCameraOn - カメラの状態
     * @param {HTMLVideoElement} videoElement - 更新された動画要素
     */
    handleCameraStateChange(isCameraOn, videoElement) {
        console.log(`カメラ状態変更: ${isCameraOn ? 'オン' : 'オフ'}`);
        
        // ビデオ要素を更新
        this.videoElement = videoElement;
        
        // 一旦検出を停止
        this.stopDetection();
        
        if (isCameraOn) {
            // カメラがオンの場合、検出を再開
            console.log('カメラがオンになったため、検出を再開します');
            
            // ビデオ要素の状態を確認
            if (!this.videoElement) {
                console.error('ビデオ要素が設定されていません');
                return;
            }
            
            if (!this.videoElement.srcObject) {
                console.error('ビデオソースが設定されていません');
                return;
            }
            
            this.isRunning = true;
            
            // ビデオが読み込まれるまで少し待ってから検出を開始
            const checkAndStart = () => {
                // ビデオの再生状態を確認
                if (this.videoElement.paused || this.videoElement.ended) {
                    console.log('ビデオが再生されていないため、再生を試みます');
                    this.videoElement.play().catch(err => {
                        console.error('ビデオ再生に失敗:', err);
                    });
                }
                
                if (this.videoElement.readyState >= 2) { // HAVE_CURRENT_DATA以上
                    console.log('ビデオの準備ができました。検出を開始します');
                    this._startDetectionInterval();
                } else {
                    console.log(`ビデオはまだ準備中です (readyState: ${this.videoElement.readyState})。再試行します`);
                    setTimeout(checkAndStart, 500); // 500ms後に再試行
                }
            };
            
            // 初回チェックを1秒後に実行
            setTimeout(checkAndStart, 1000);
        }
    }
    
    /**
     * 検出状態をリセット
     */
    resetDetection() {
        console.log('検出状態をリセットします...');
        // 実行状態を確認
        const wasRunning = this.isRunning;
        
        // 一旦検出を停止
        this.stopDetection();
        
        // ビデオ要素が有効かチェック
        if (!this.videoElement) {
            console.warn('ビデオ要素が設定されていません');
            return;
        }
        
        if (!this.videoElement.srcObject) {
            console.warn('ビデオソースが設定されていません');
            return;
        }
        
        // ビデオが再生中かどうか確認
        if (this.videoElement.paused || this.videoElement.ended) {
            console.warn('ビデオが再生されていないため、検出を再開できません');
            return;
        }
        
        // ビデオが準備できているか確認
        if (this.videoElement.readyState < 2) { // HAVE_CURRENT_DATA未満
            console.warn(`ビデオの準備ができていません (readyState: ${this.videoElement.readyState})`);
            // 念のため再生を試みる
            this.videoElement.play().catch(err => {
                console.error('ビデオ再生の再試行に失敗:', err);
            });
        }
        
        if (wasRunning && this.detectionCallback) {
            console.log('検出を再開します');
            this.isRunning = true;
            this._startDetectionInterval();
        } else {
            console.log('検出は元々停止していたか、コールバックが設定されていません');
        }
    }

    /**
     * 検出の一時停止を設定
     * @param {boolean} isPaused - 検出を一時停止するかどうか
     */
    setPauseDetection(isPaused) {
        this.pauseDetection = isPaused;
        console.log(`検出の一時停止を設定しました: ${isPaused ? '停止' : '再開'}`);
    }
} 