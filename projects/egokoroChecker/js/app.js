/**
 * アプリケーションのメインクラス
 */
class App {
    constructor() {
        this.ui = new UI();
        this.detector = new ObjectDetector();
        this.game = new EgokoroGame();
        
        // 検出器をゲームに設定
        this.game.setDetector(this.detector);
        
        // 絵心チェックモードのフラグ
        this.isEgokoroMode = false;
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

            // 絵心チェックゲームの初期化
            this._initializeGame();

            // カメラ状態変更時の処理を設定
            this.ui.onCameraStateChange = (isCameraOn, videoElement) => {
                console.log(`カメラ状態変更イベント: ${isCameraOn ? 'オン' : 'オフ'}`);
                try {
                    // ビデオ要素のログ
                    console.log(`ビデオ要素の状態: readyState=${videoElement.readyState}, srcObject=${videoElement.srcObject ? '設定済み' : '未設定'}`);
                    
                    // 検出器にカメラ状態変更を通知
                    this.detector.handleCameraStateChange(isCameraOn, videoElement);
                    
                    // カメラがオンになった場合
                    if (isCameraOn) {
                        // すぐに検出状態をリセット
                        setTimeout(() => {
                            console.log('検出状態をリセットします（1回目）');
                            this.detector.resetDetection();
                            
                            // 検出が再開されたことを確認
                            if (this.detector.isRunning) {
                                console.log('検出が再開されました');
                            } else {
                                console.warn('検出が再開されていません。検出を強制的に再開します');
                                // 検出が再開されていない場合は強制的に再開
                                this.detector.startDetection(this.ui.video, (predictions) => {
                                    // 検出結果を処理
                                    try {
                                        // 描画処理
                                        this.ui.drawPredictions(predictions);
                                        
                                        // 絵心チェックモードの場合、判定処理を行う
                                        if (this.isEgokoroMode) {
                                            this.game.judgeDetection(predictions);
                                        }
                                    } catch (error) {
                                        console.error('検出結果処理中にエラーが発生しました:', error);
                                    }
                                });
                            }
                        }, 1000);
                        
                        // 念のため3秒後にもう一度検出をリセット
                        setTimeout(() => {
                            console.log('再確認: 検出状態をリセットします（2回目）');
                            this.detector.resetDetection();
                        }, 3000);
                    }
                } catch (error) {
                    console.error('カメラ状態変更処理中にエラーが発生しました:', error);
                }
            };

            // 検出の開始
            this.ui.showStatus('準備完了');
            this.detector.startDetection(this.ui.video, (predictions) => {
                // 検出結果を処理
                try {
                    // 描画処理
                    this.ui.drawPredictions(predictions);
                    
                    // 絵心チェックモードの場合、判定処理を行う
                    if (this.isEgokoroMode) {
                        this.game.judgeDetection(predictions);
                    }
                } catch (error) {
                    console.error('検出結果処理中にエラーが発生しました:', error);
                }
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
    
    /**
     * 絵心チェックゲームの初期化
     */
    _initializeGame() {
        // ゲームのコールバック設定
        this.game.onTimeUpdate = (seconds) => {
            this.ui.updateTimer(seconds);
        };
        
        this.game.onTopicChange = (topic, current, total) => {
            this.ui.updateTopic(topic, current, total);
        };
        
        this.game.onJudgement = (isCorrect, prediction, topic) => {
            this.ui.showJudgement(isCorrect, prediction, topic);
        };
        
        this.game.onGameOver = (score, total, accuracy, evaluation) => {
            this.ui.showResultScreen(score, total, accuracy, evaluation);
            this.isEgokoroMode = false;
        };
        
        this.game.onCorrectAnswer = () => {
            this.ui.showNextTopicButton();
        };
        
        this.game.onTimeUp = () => {
            this.ui.showNextTopicButton();
        };
        
        this.game.onPauseStateChange = (isPaused) => {
            this.ui.updatePauseState(isPaused);
        };
        
        // UIのコールバック設定
        this.ui.initializeGameUI(
            // ゲーム開始時のコールバック
            (topicCount, timeMode) => {
                this.game.initialize(topicCount, timeMode);
                this.game.start();
                this.isEgokoroMode = true;
                this.ui.showGameScreen();
            },
            // 再開時のコールバック
            () => {
                this.ui.showStartScreen();
            },
            // 次のお題ボタンクリック時のコールバック
            () => {
                if (this.game.isReadyForNextTopic()) {
                    this.game.goToNextTopic();
                }
            },
            // カメラ切り替えボタンクリック時のコールバック
            () => {
                this.ui.toggleCamera();
            },
            // ゲーム中止ボタンクリック時のコールバック
            () => {
                // ゲームを停止して開始画面に戻る
                this.game.stop();
                this.isEgokoroMode = false;
                this.ui.showStartScreen();
            },
            // 一時停止ボタンクリック時のコールバック
            () => {
                if (this.isEgokoroMode) {
                    this.game.togglePause();
                }
            }
        );
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start();
}); 