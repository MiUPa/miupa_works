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
        
        // 絵心チェックモード用のUI要素
        this.gameContainer = document.getElementById('game-container');
        this.startScreenContainer = document.getElementById('start-screen');
        this.gameScreenContainer = document.getElementById('game-screen');
        this.resultScreenContainer = document.getElementById('result-screen');
        this.topicElement = document.getElementById('current-topic');
        this.progressElement = document.getElementById('progress');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.topicCountSelect = document.getElementById('topic-count');
        this.timeModeSelect = document.getElementById('time-mode');
        this.timeModeDescription = document.getElementById('time-mode-description');
        this.startButton = document.getElementById('start-game');
        this.restartButton = document.getElementById('restart-game');
        this.judgementElement = document.getElementById('judgement');
        this.resultScoreElement = document.getElementById('result-score');
        this.resultEvaluationElement = document.getElementById('result-evaluation');
        this.nextTopicButton = document.getElementById('next-topic');
        this.toggleCameraButton = document.getElementById('toggle-camera');
        this.quitGameButton = document.getElementById('quit-game');
        this.pauseGameButton = document.getElementById('pause-game');
        
        // カメラ関連
        this.cameraStream = null;
        this.isCameraOn = true;
        this.videoOffMessage = null;
        this.pauseOverlay = null; // 一時停止オーバーレイ
        this.onCameraStateChange = null; // カメラ状態変更コールバック
        this.isMirrorMode = true; // ミラーモード（左右反転表示）をデフォルトで有効に
        
        // 判定結果の表示タイマー
        this.judgementTimer = null;
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
            
            this.cameraStream = stream;
            this.video.srcObject = stream;
            this.isCameraOn = true;
            this._updateCameraButtonState();
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    
                    // カメラサイズを記録
                    this.videoWidth = this.video.videoWidth;
                    this.videoHeight = this.video.videoHeight;
                    
                    // キャンバスのサイズを設定
                    this.canvas.width = this.videoWidth;
                    this.canvas.height = this.videoHeight;
                    
                    // video要素のスタイルを設定して固定サイズにする
                    const videoContainer = this.video.parentElement;
                    if (videoContainer) {
                        videoContainer.style.width = `${this.canvas.width}px`;
                        videoContainer.style.height = `${this.canvas.height}px`;
                    }
                    
                    // video要素とcanvas要素のスタイルを直接設定
                    this.video.style.width = '100%';
                    this.video.style.height = '100%';
                    this.canvas.style.width = '100%';
                    this.canvas.style.height = '100%';
                    
                    // ミラーモードを適用
                    this._applyMirrorMode();
                    
                    resolve();
                };
            });
        } catch (error) {
            console.error('カメラの初期化に失敗:', error);
            throw error;
        }
    }

    /**
     * ミラーモード（左右反転）を適用
     */
    _applyMirrorMode() {
        // 常にミラーモード（左右反転）を適用
        this.video.style.transform = 'scaleX(-1)';
        this.canvas.style.transform = 'scaleX(-1)';
    }

    /**
     * カメラのオン/オフを切り替える
     * @returns {Promise<boolean>} 操作後のカメラの状態（true: オン、false: オフ）
     */
    async toggleCamera() {
        console.log('カメラ切り替え開始...');

        if (this.isCameraOn) {
            this._turnOffCamera();
            this._updateCameraButtonState();
            
            // 状態変更コールバックは非同期で呼び出す（カメラの状態が完全に変わったあと）
            setTimeout(() => {
                console.log('カメラオフ状態変更通知');
                if (this.onCameraStateChange) {
                    this.onCameraStateChange(this.isCameraOn, this.video);
                }
            }, 100);
        } else {
            try {
                // カメラをオンにする処理が完了するのを待つ
                console.log('カメラオン処理を開始...');
                await this._turnOnCamera();
                console.log('カメラオン処理が完了しました');
                
                // カメラがオンになった後で状態を更新
                this._updateCameraButtonState();
                
                // カメラがオンになったことを通知
                console.log('カメラオン状態変更通知');
                if (this.onCameraStateChange) {
                    // より長い遅延を設定して、ビデオ要素が完全に準備できる時間を確保
                    setTimeout(() => {
                        console.log('カメラオン状態変更コールバック実行');
                        this.onCameraStateChange(this.isCameraOn, this.video);
                    }, 500);
                }
            } catch (error) {
                console.error('カメラ切り替え中にエラーが発生:', error);
            }
        }
        
        console.log(`カメラ切り替え完了: 現在の状態は${this.isCameraOn ? 'オン' : 'オフ'}です`);
        return this.isCameraOn;
    }
    
    /**
     * カメラをオフにする
     */
    _turnOffCamera() {
        if (!this.cameraStream) return;
        
        // トラックを停止
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.video.srcObject = null;
        this.isCameraOn = false;
        
        // カメラオフメッセージを表示
        if (!this.videoOffMessage) {
            this.videoOffMessage = document.createElement('div');
            this.videoOffMessage.className = 'video-off-message';
            this.videoOffMessage.textContent = 'カメラはオフになっています';
            this.video.parentElement.appendChild(this.videoOffMessage);
            
            // メッセージ要素のスタイルを設定
            this.videoOffMessage.style.position = 'absolute';
            this.videoOffMessage.style.top = '50%';
            this.videoOffMessage.style.left = '50%';
            this.videoOffMessage.style.transform = 'translate(-50%, -50%)';
            this.videoOffMessage.style.color = 'white';
            this.videoOffMessage.style.fontSize = '18px';
            this.videoOffMessage.style.textAlign = 'center';
            this.videoOffMessage.style.zIndex = '10';
        } else {
            this.videoOffMessage.style.display = 'block';
        }
        
        // カメラのサイズを維持するために黒背景を表示
        // キャンバスの元のサイズを保持
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ビデオ要素とビデオコンテナのサイズが変わらないことを確認
        const videoContainer = this.video.parentElement;
        if (videoContainer) {
            videoContainer.style.width = `${this.videoWidth}px`;
            videoContainer.style.height = `${this.videoHeight}px`;
        }
        
        this.video.style.display = 'none'; // ビデオを非表示
        this.canvas.style.display = 'block'; // キャンバスを表示
        
        console.log('カメラをオフにしました');
    }
    
    /**
     * カメラをオンにする
     */
    async _turnOnCamera() {
        try {
            console.log('カメラをオンにします...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: CONFIG.camera
            });
            
            this.cameraStream = stream;
            this.video.srcObject = stream;
            
            // ビデオ要素を再表示
            this.video.style.display = 'block';
            
            // ビデオの再生を明示的に開始し、完了を待つ
            console.log('ビデオの再生を準備中...');
            await new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    console.log('ビデオのメタデータがロードされました');
                    
                    // 重要: キャンバスサイズを保存したサイズに設定
                    this.canvas.width = this.videoWidth;
                    this.canvas.height = this.videoHeight;
                    
                    // video要素のスタイルを設定して固定サイズにする
                    const videoContainer = this.video.parentElement;
                    if (videoContainer) {
                        videoContainer.style.width = `${this.canvas.width}px`;
                        videoContainer.style.height = `${this.canvas.height}px`;
                    }
                    
                    // video要素とcanvas要素のスタイルを直接設定
                    this.video.style.width = '100%';
                    this.video.style.height = '100%';
                    this.canvas.style.width = '100%';
                    this.canvas.style.height = '100%';
                    
                    // ミラーモードを再適用
                    this._applyMirrorMode();
                    
                    this.video.play()
                        .then(() => {
                            console.log('ビデオの再生を開始しました');
                            // 再生が始まったら少し待ってから完了とする（ブラウザによっては少し時間がかかる）
                            setTimeout(() => {
                                resolve();
                            }, 200);
                        })
                        .catch(err => {
                            console.error('ビデオの再生開始に失敗:', err);
                            reject(err);
                        });
                };
                
                this.video.onerror = (err) => {
                    console.error('ビデオ要素でエラーが発生:', err);
                    reject(new Error('ビデオの読み込みエラー'));
                };
                
                // タイムアウト設定（5秒後にタイムアウト）
                setTimeout(() => {
                    if (this.video.readyState < 2) { // HAVE_CURRENT_DATA未満
                        console.warn('ビデオのロードがタイムアウトしました。続行します。');
                        resolve(); // タイムアウトしても処理は続行
                    }
                }, 5000);
            });
            
            this.isCameraOn = true;
            
            // カメラオフメッセージを非表示
            if (this.videoOffMessage) {
                this.videoOffMessage.style.display = 'none';
            }
            
            // キャンバスをクリア
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            console.log('カメラをオンにしました');
        } catch (error) {
            console.error('カメラの再開に失敗:', error);
            this.showError('カメラの再開に失敗しました。ページを再読み込みしてください。');
            throw error; // エラーを上位に伝搬
        }
    }
    
    /**
     * カメラボタンの状態を更新
     */
    _updateCameraButtonState() {
        if (!this.toggleCameraButton) return;
        
        if (this.isCameraOn) {
            this.toggleCameraButton.classList.remove('off');
            this.toggleCameraButton.querySelector('i').className = 'fas fa-video';
        } else {
            this.toggleCameraButton.classList.add('off');
            this.toggleCameraButton.querySelector('i').className = 'fas fa-video-slash';
        }
    }

    /**
     * 検出結果を描画
     * @param {Array} predictions - 検出結果の配列
     */
    drawPredictions(predictions) {
        if (!this.isCameraOn) return;
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 常にミラーモードで描画（キャンバスは左右反転表示されているため、描画も反転する）
        this.context.save();
        // キャンバス全体を左右反転
        this.context.translate(this.canvas.width, 0);
        this.context.scale(-1, 1);
        
        this.context.strokeStyle = CONFIG.detection.colors.box;
        this.context.lineWidth = CONFIG.drawing.lineWidth;
        this.context.font = CONFIG.drawing.font;
        this.context.fillStyle = CONFIG.detection.colors.text;

        predictions.forEach(prediction => {
            let [x, y, width, height] = prediction.bbox;
            
            // バウンディングボックスを描画
            this.context.strokeRect(x, y, width, height);
            
            // ラベルとスコアを描画
            const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            const textY = y > 10 ? y - 5 : 10;
            
            // テキストが読みやすいように位置を調整
            this.context.fillText(label, x + width - this.context.measureText(label).width - 5, textY);
        });
        
        // 変換を元に戻す
        this.context.restore();
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
    
    /**
     * 絵心チェックゲームのUIを初期化
     * @param {Function} onStart - ゲーム開始時のコールバック
     * @param {Function} onRestart - ゲーム再開時のコールバック
     * @param {Function} onNextTopic - 次のお題ボタンクリック時のコールバック
     * @param {Function} onToggleCamera - カメラ切り替えボタンクリック時のコールバック
     * @param {Function} onQuitGame - ゲーム中止ボタンクリック時のコールバック
     * @param {Function} onTogglePause - 一時停止ボタンクリック時のコールバック
     */
    initializeGameUI(onStart, onRestart, onNextTopic, onToggleCamera, onQuitGame, onTogglePause) {
        // お題数選択の初期化
        this._initializeTopicCountSelect();
        
        // 制限時間モード選択の初期化
        this._initializeTimeModeSelect();
        
        // ゲーム開始ボタンのイベントリスナー
        this.startButton.addEventListener('click', () => {
            const topicCount = parseInt(this.topicCountSelect.value);
            const timeMode = this.timeModeSelect.value;
            if (onStart) onStart(topicCount, timeMode);
        });
        
        // 再開ボタンのイベントリスナー
        this.restartButton.addEventListener('click', () => {
            if (onRestart) onRestart();
        });
        
        // 次のお題ボタンのイベントリスナー
        this.nextTopicButton.addEventListener('click', () => {
            if (onNextTopic) onNextTopic();
        });
        
        // カメラ切り替えボタンのイベントリスナー
        this.toggleCameraButton.addEventListener('click', () => {
            if (onToggleCamera) onToggleCamera();
        });
        
        // ゲーム中止ボタンのイベントリスナー
        this.quitGameButton.addEventListener('click', () => {
            if (onQuitGame) onQuitGame();
        });
        
        // 一時停止ボタンのイベントリスナー
        this.pauseGameButton.addEventListener('click', () => {
            if (onTogglePause) onTogglePause();
        });
        
        // 初期画面を表示
        this.showStartScreen();
    }
    
    /**
     * お題数選択セレクトボックスを初期化
     */
    _initializeTopicCountSelect() {
        this.topicCountSelect.innerHTML = '';
        
        for (let i = CONFIG.egokoroCheck.minTopicCount; i <= CONFIG.egokoroCheck.maxTopicCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}問`;
            
            if (i === CONFIG.egokoroCheck.defaultTopicCount) {
                option.selected = true;
            }
            
            this.topicCountSelect.appendChild(option);
        }
    }
    
    /**
     * 制限時間モード選択セレクトボックスを初期化
     */
    _initializeTimeModeSelect() {
        this.timeModeSelect.innerHTML = '';
        
        CONFIG.egokoroCheck.timeModes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode.id;
            option.textContent = `${mode.name} (${mode.time}秒)`;
            
            if (mode.id === CONFIG.egokoroCheck.defaultTimeMode) {
                option.selected = true;
                this.timeModeDescription.textContent = mode.description;
            }
            
            this.timeModeSelect.appendChild(option);
        });
        
        // モード選択が変更されたときの処理
        this.timeModeSelect.addEventListener('change', () => {
            const selectedMode = CONFIG.egokoroCheck.timeModes.find(
                mode => mode.id === this.timeModeSelect.value
            );
            if (selectedMode) {
                this.timeModeDescription.textContent = selectedMode.description;
            }
        });
    }
    
    /**
     * ゲーム開始画面を表示
     */
    showStartScreen() {
        this.startScreenContainer.style.display = 'block';
        this.gameScreenContainer.style.display = 'none';
        this.resultScreenContainer.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.statusElement.style.display = 'none';
        this.judgementElement.style.display = 'none';
        this.nextTopicButton.style.display = 'none';
    }
    
    /**
     * ゲーム画面を表示
     */
    showGameScreen() {
        this.startScreenContainer.style.display = 'none';
        this.gameScreenContainer.style.display = 'block';
        this.resultScreenContainer.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.statusElement.style.display = 'none';
        this.nextTopicButton.style.display = 'none';
    }
    
    /**
     * 結果画面を表示
     * @param {number} score - 得点
     * @param {number} topicCount - お題の総数
     * @param {number} accuracy - 正解率 (0-1)
     * @param {string} evaluation - 評価結果
     */
    showResultScreen(score, topicCount, accuracy, evaluation) {
        this.resultScoreElement.textContent = `${score}/${topicCount} 正解 (${Math.round(accuracy * 100)}%)`;
        this.resultEvaluationElement.textContent = evaluation;
        
        this.startScreenContainer.style.display = 'none';
        this.gameScreenContainer.style.display = 'none';
        this.resultScreenContainer.style.display = 'block';
        this.gameContainer.style.display = 'block';
        this.statusElement.style.display = 'none';
        this.judgementElement.style.display = 'none';
        this.nextTopicButton.style.display = 'none';
    }
    
    /**
     * お題を更新
     * @param {Object} topic - 現在のお題
     * @param {number} current - 現在の問題番号
     * @param {number} total - 総問題数
     */
    updateTopic(topic, current, total) {
        this.topicElement.textContent = topic.ja;
        this.progressElement.textContent = `${current}/${total}問目`;
        this.nextTopicButton.style.display = 'none';
    }
    
    /**
     * タイマーを更新
     * @param {number} seconds - 残り秒数
     */
    updateTimer(seconds) {
        this.timerElement.textContent = `残り時間: ${seconds}秒`;
        
        // 残り時間が少ない場合は警告色に
        if (seconds <= 5) {
            this.timerElement.style.color = 'red';
        } else {
            this.timerElement.style.color = 'black';
        }
    }
    
    /**
     * 次のお題ボタンを表示
     */
    showNextTopicButton() {
        this.nextTopicButton.style.display = 'block';
    }
    
    /**
     * 判定結果を表示
     * @param {boolean} isCorrect - 正解かどうか
     * @param {Object} prediction - 検出結果
     * @param {Object} topic - 現在のお題
     */
    showJudgement(isCorrect, prediction, topic) {
        // 前回のタイマーをクリア
        if (this.judgementTimer) {
            clearTimeout(this.judgementTimer);
        }
        
        const detectedClass = prediction ? prediction.class : 'なし';
        const detectedJa = CONFIG.cocoClasses.find(c => c.id === detectedClass)?.ja || detectedClass;
        const score = prediction ? Math.round(prediction.score * 100) : 0;
        
        if (isCorrect) {
            this.judgementElement.textContent = `正解！「${topic.ja}」と判定されました (${score}%)`;
            this.judgementElement.className = 'judgement correct';
        } else {
            this.judgementElement.textContent = `「${detectedJa}」と判定されました (${score}%) - お題:「${topic.ja}」`;
            this.judgementElement.className = 'judgement incorrect';
        }
        
        this.judgementElement.style.display = 'block';
        
        // 10秒後に非表示
        this.judgementTimer = setTimeout(() => {
            this.judgementElement.style.display = 'none';
        }, 10000);
    }

    /**
     * 一時停止状態を更新
     * @param {boolean} isPaused - 一時停止中かどうか
     */
    updatePauseState(isPaused) {
        if (isPaused) {
            // 一時停止中は再開ボタンに変更して強調表示
            this.pauseGameButton.textContent = '再開';
            this.pauseGameButton.classList.remove('btn-secondary');
            this.pauseGameButton.classList.add('btn-resume');
            
            // 現在のビデオフレームをキャンバスにキャプチャしてフリーズさせる
            this._freezeVideoFrame();
            
            // 一時停止オーバーレイを表示
            this._showPauseOverlay();
        } else {
            // 通常の一時停止ボタンに戻す
            this.pauseGameButton.textContent = '一時停止';
            this.pauseGameButton.classList.remove('btn-resume');
            this.pauseGameButton.classList.add('btn-secondary');
            
            // ビデオフレームのフリーズを解除して再開
            this._unfreezeVideoFrame();
            
            // 一時停止オーバーレイを非表示
            this._hidePauseOverlay();
        }
    }
    
    /**
     * 現在のビデオフレームをキャプチャしてフリーズさせる
     * @private
     */
    _freezeVideoFrame() {
        // ビデオの現在のフレームをキャンバスに描画
        if (this.isCameraOn && this.video.readyState >= 2) {
            // キャンバスのコンテキストを取得
            const ctx = this.canvas.getContext('2d');
            
            // ミラーモードに合わせて描画
            ctx.save();
            
            // キャンバス全体をクリア
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // ミラーモードの場合は左右反転して描画
            if (this.isMirrorMode) {
                ctx.translate(this.canvas.width, 0);
                ctx.scale(-1, 1);
            }
            
            // ビデオフレームをキャンバスに描画
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // 変換をリセット
            ctx.restore();
            
            // ビデオを非表示にしてキャンバスのみ表示
            this.video.style.visibility = 'hidden';
            this.canvas.style.visibility = 'visible';
        }
    }
    
    /**
     * ビデオフレームのフリーズを解除
     * @private
     */
    _unfreezeVideoFrame() {
        // ビデオ要素を再表示
        this.video.style.visibility = 'visible';
        
        // キャンバスをクリア（検出結果の描画用に使用されるため、完全に非表示にはしない）
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 一時停止オーバーレイを表示
     * @private
     */
    _showPauseOverlay() {
        // すでに存在する場合は何もしない
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'flex';
            return;
        }
        
        // オーバーレイ要素を作成
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.className = 'pause-overlay';
        
        // メッセージ要素を作成
        const pauseMessage = document.createElement('div');
        pauseMessage.className = 'pause-message';
        pauseMessage.textContent = 'ゲームを一時停止中';
        
        // オーバーレイにメッセージを追加
        this.pauseOverlay.appendChild(pauseMessage);
        
        // ビデオコンテナにオーバーレイを追加
        this.video.parentElement.appendChild(this.pauseOverlay);
    }
    
    /**
     * 一時停止オーバーレイを非表示
     * @private
     */
    _hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'none';
        }
    }
} 