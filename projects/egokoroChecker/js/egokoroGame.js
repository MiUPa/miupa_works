/**
 * 絵心チェックゲームを管理するクラス
 */
class EgokoroGame {
    constructor() {
        this.topics = [];
        this.currentTopicIndex = 0;
        this.score = 0;
        this.isGameRunning = false;
        this.remainingTime = 0;
        this.timer = null;
        this.topicCount = CONFIG.egokoroCheck.defaultTopicCount;
        this.timeMode = CONFIG.egokoroCheck.defaultTimeMode;
        this.gameTime = this._getGameTimeByMode(CONFIG.egokoroCheck.defaultTimeMode);
        this.readyForNextTopic = false;
        this.isPaused = false; // 一時停止フラグ
        this.detector = null; // 物体検出器への参照
        
        // コールバック関数
        this.onTimeUpdate = null;
        this.onGameOver = null;
        this.onTopicChange = null;
        this.onJudgement = null;
        this.onCorrectAnswer = null;
        this.onTimeUp = null;
        this.onPauseStateChange = null; // 一時停止状態変更コールバック
    }

    /**
     * 物体検出器を設定
     * @param {ObjectDetector} detector - 使用する物体検出器
     */
    setDetector(detector) {
        this.detector = detector;
        console.log('検出器が設定されました');
    }

    /**
     * ゲームを初期化
     * @param {number} topicCount - 出題するお題の数
     * @param {string} timeMode - 制限時間モード
     */
    initialize(topicCount, timeMode) {
        this.topicCount = topicCount || CONFIG.egokoroCheck.defaultTopicCount;
        this.timeMode = timeMode || CONFIG.egokoroCheck.defaultTimeMode;
        this.gameTime = this._getGameTimeByMode(this.timeMode);
        this.topics = this._generateRandomTopics(this.topicCount);
        this.currentTopicIndex = 0;
        this.score = 0;
        this.isGameRunning = false;
        this.remainingTime = this.gameTime;
        this.readyForNextTopic = false;
    }

    /**
     * モードIDに基づいて制限時間を取得
     * @param {string} modeId - 時間モードのID
     * @returns {number} 制限時間（秒）
     * @private
     */
    _getGameTimeByMode(modeId) {
        const mode = CONFIG.egokoroCheck.timeModes.find(m => m.id === modeId);
        return mode ? mode.time : CONFIG.egokoroCheck.gameTime; // 見つからない場合はデフォルトの時間
    }

    /**
     * ゲームを開始
     */
    start() {
        if (this.isGameRunning) return;
        
        this.isGameRunning = true;
        this.remainingTime = this.gameTime;
        this.readyForNextTopic = false;
        
        // 最初のお題を設定
        if (this.onTopicChange) {
            this.onTopicChange(this.getCurrentTopic(), this.currentTopicIndex + 1, this.topicCount);
        }
        
        // タイマーを開始
        this._startTimer();
    }

    /**
     * ゲームを停止
     */
    stop() {
        this.isGameRunning = false;
        this.isPaused = false;
        this._stopTimer();
    }

    /**
     * 現在のお題を取得
     * @returns {Object} 現在のお題情報
     */
    getCurrentTopic() {
        return this.topics[this.currentTopicIndex];
    }

    /**
     * 次のお題に進む準備ができているか
     */
    isReadyForNextTopic() {
        return this.readyForNextTopic;
    }

    /**
     * 次のお題に手動で進む
     */
    goToNextTopic() {
        if (!this.readyForNextTopic) return;
        
        this.currentTopicIndex++;
        
        // すべてのお題が終了した場合
        if (this.currentTopicIndex >= this.topics.length) {
            this._gameOver();
            return;
        }
        
        // 次のお題を設定
        if (this.onTopicChange) {
            this.onTopicChange(this.getCurrentTopic(), this.currentTopicIndex + 1, this.topicCount);
        }
        
        // タイマーをリセット
        this.remainingTime = this.gameTime;
        this.readyForNextTopic = false;
        
        // タイマーを開始
        this._startTimer();
    }

    /**
     * 検出結果を判定
     * @param {Array} predictions - 物体検出の結果
     * @returns {boolean} 正解であればtrue
     */
    judgeDetection(predictions) {
        if (!this.isGameRunning || predictions.length === 0 || this.readyForNextTopic) return false;
        
        const currentTopic = this.getCurrentTopic();
        let isCorrect = false;
        let highestScorePrediction = null;
        
        // 最も信頼度の高い検出結果を取得
        predictions.forEach(prediction => {
            if (!highestScorePrediction || prediction.score > highestScorePrediction.score) {
                highestScorePrediction = prediction;
            }
        });
        
        // 判定結果
        if (highestScorePrediction) {
            isCorrect = (highestScorePrediction.class === currentTopic.id && 
                         highestScorePrediction.score >= CONFIG.egokoroCheck.judgementThreshold);
            
            // 正解の場合
            if (isCorrect) {
                this.score++;
                this._pauseForNextTopic('correct');
            }
            
            // 判定結果のコールバック
            if (this.onJudgement) {
                this.onJudgement(isCorrect, highestScorePrediction, currentTopic);
            }
        }
        
        return isCorrect;
    }

    /**
     * 次のお題に進む前に一時停止
     * @param {string} reason - 一時停止の理由（'correct'または'timeup'）
     */
    _pauseForNextTopic(reason) {
        this._stopTimer();
        this.readyForNextTopic = true;
        
        if (reason === 'correct' && this.onCorrectAnswer) {
            this.onCorrectAnswer();
        } else if (reason === 'timeup' && this.onTimeUp) {
            this.onTimeUp();
        }
    }

    /**
     * ゲーム終了処理
     */
    _gameOver() {
        this.isGameRunning = false;
        this._stopTimer();
        
        const accuracy = this.score / this.topicCount;
        const evaluation = this._evaluateAccuracy(accuracy);
        
        // ゲーム終了コールバック
        if (this.onGameOver) {
            this.onGameOver(this.score, this.topicCount, accuracy, evaluation);
        }
    }

    /**
     * タイマーを開始
     */
    _startTimer() {
        this._stopTimer();
        this.timer = setInterval(() => {
            this.remainingTime--;
            
            // 時間経過のコールバック
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.remainingTime);
            }
            
            // 時間切れ
            if (this.remainingTime <= 0) {
                this._pauseForNextTopic('timeup');
            }
        }, 1000);
    }

    /**
     * タイマーを停止
     */
    _stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * ランダムなお題を生成
     * @param {number} count - 生成するお題の数
     * @returns {Array} お題の配列
     */
    _generateRandomTopics(count) {
        // クラスリストをシャッフル
        const shuffled = [...CONFIG.cocoClasses].sort(() => 0.5 - Math.random());
        
        // 指定数のお題を選択
        return shuffled.slice(0, count);
    }

    /**
     * 正解率に基づいて評価を行う
     * @param {number} accuracy - 正解率 (0-1)
     * @returns {string} 評価結果
     */
    _evaluateAccuracy(accuracy) {
        if (accuracy >= CONFIG.egokoroCheck.evaluation.perfect) {
            return '絵心天才！';
        } else if (accuracy >= CONFIG.egokoroCheck.evaluation.excellent) {
            return '素晴らしい絵心！';
        } else if (accuracy >= CONFIG.egokoroCheck.evaluation.good) {
            return '良い絵心！';
        } else if (accuracy >= CONFIG.egokoroCheck.evaluation.average) {
            return '普通の絵心';
        } else if (accuracy >= CONFIG.egokoroCheck.evaluation.poor) {
            return '絵心要努力';
        } else {
            return '絵心皆無';
        }
    }

    /**
     * 一時停止・再開を切り替える
     * @returns {boolean} 切り替え後の一時停止状態
     */
    togglePause() {
        // ゲームが開始していない場合は何もしない
        if (!this.isGameRunning || this.readyForNextTopic) return this.isPaused;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // 一時停止処理
            this._pauseGame();
        } else {
            // 再開処理
            this._resumeGame();
        }
        
        // 一時停止状態が変わったことを通知
        if (this.onPauseStateChange) {
            this.onPauseStateChange(this.isPaused);
        }
        
        return this.isPaused;
    }
    
    /**
     * ゲームを一時停止する
     * @private
     */
    _pauseGame() {
        // タイマーを停止
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 検出処理を一時停止
        if (this.detector) {
            this.detector.setPauseDetection(true);
            console.log("検出を一時停止しました");
        } else {
            console.warn("検出器が設定されていないため、検出を一時停止できません");
        }
        console.log("ゲームを一時停止しました");
    }
    
    /**
     * ゲームを再開する
     * @private
     */
    _resumeGame() {
        // 検出処理を再開
        if (this.detector) {
            this.detector.setPauseDetection(false);
            console.log("検出を再開しました");
        } else {
            console.warn("検出器が設定されていないため、検出を再開できません");
        }
        
        // タイマーを再開
        if (!this.timer && this.remainingTime > 0) {
            this.timer = setInterval(() => {
                this.remainingTime--;
                
                // タイマーコールバック
                if (this.onTimeUpdate) {
                    this.onTimeUpdate(this.remainingTime);
                }
                
                // 時間切れ
                if (this.remainingTime <= 0) {
                    this._pauseForNextTopic('timeup');
                }
            }, 1000);
        }
        console.log("ゲームを再開しました");
    }

    /**
     * 現在の一時停止状態を返す
     * @returns {boolean} 一時停止中かどうか
     */
    isPauseState() {
        return this.isPaused;
    }
} 