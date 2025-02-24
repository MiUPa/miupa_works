/**
 * アプリケーションの設定
 */
const CONFIG = {
    // 検出の設定
    detection: {
        interval: 100,  // 検出間隔（ミリ秒）
        minScore: 0.5,  // 最小信頼度スコア
        colors: {
            box: '#00ff00',  // バウンディングボックスの色
            text: '#00ff00'  // テキストの色
        }
    },
    
    // 描画の設定
    drawing: {
        font: '16px "Helvetica Neue", Arial, sans-serif',
        lineWidth: 2
    },
    
    // カメラの設定
    camera: {
        width: 640,
        height: 480,
        facingMode: 'environment'  // バックカメラを優先
    }
}; 