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
    },
    
    // 絵心チェックモードの設定
    egokoroCheck: {
        // 制限時間モード
        timeModes: [
            {
                id: 'normal',
                name: '通常モード',
                description: '標準的な制限時間です',
                time: 30 // 秒
            },
            {
                id: 'hokusai',
                name: '北斎モード',
                description: '素早く描こう！生涯で3万点以上もの作品を残した浮世絵の巨匠のスピードに挑戦',
                time: 15 // 秒
            },
            {
                id: 'davinci',
                name: 'ダ・ヴィンチモード',
                description: '「モナ・リザ」を16年かけて完成させた巨匠のように、じっくり時間をかけて描こう',
                time: 60 // 秒
            }
        ],
        defaultTimeMode: 'normal', // デフォルト時間モード
        gameTime: 30,  // 1問あたりの制限時間（秒）- 互換性のために残す
        defaultTopicCount: 5,  // デフォルトのお題数
        minTopicCount: 3,      // 最小お題数
        maxTopicCount: 10,     // 最大お題数
        judgementThreshold: 0.4,  // 正解と判定する最小信頼度スコア
        
        // 評価基準
        evaluation: {
            perfect: 1.0,   // 100% - 素晴らしい絵心
            excellent: 0.8, // 80% - 優れた絵心
            good: 0.6,      // 60% - 良い絵心
            average: 0.4,   // 40% - 普通の絵心
            poor: 0.2,      // 20% - 絵心要努力
            // 20%未満 - 絵心皆無
        }
    },
    
    // COCO-SSDモデルで検出可能なクラスリスト
    // 日本語名を追加
    cocoClasses: [
        {id: 'person', ja: '人'},
        {id: 'bicycle', ja: '自転車'},
        {id: 'car', ja: '車'},
        {id: 'motorcycle', ja: 'バイク'},
        {id: 'airplane', ja: '飛行機'},
        {id: 'bus', ja: 'バス'},
        {id: 'train', ja: '電車'},
        {id: 'truck', ja: 'トラック'},
        {id: 'boat', ja: 'ボート'},
        {id: 'traffic light', ja: '信号機'},
        {id: 'fire hydrant', ja: '消火栓'},
        {id: 'stop sign', ja: '一時停止標識'},
        {id: 'parking meter', ja: 'パーキングメーター'},
        {id: 'bench', ja: 'ベンチ'},
        {id: 'bird', ja: '鳥'},
        {id: 'cat', ja: '猫'},
        {id: 'dog', ja: '犬'},
        {id: 'horse', ja: '馬'},
        {id: 'sheep', ja: '羊'},
        {id: 'cow', ja: '牛'},
        {id: 'elephant', ja: '象'},
        {id: 'bear', ja: 'クマ'},
        {id: 'zebra', ja: 'シマウマ'},
        {id: 'giraffe', ja: 'キリン'},
        {id: 'backpack', ja: 'バックパック'},
        {id: 'umbrella', ja: '傘'},
        {id: 'handbag', ja: 'ハンドバッグ'},
        {id: 'tie', ja: 'ネクタイ'},
        {id: 'suitcase', ja: 'スーツケース'},
        {id: 'frisbee', ja: 'フリスビー'},
        {id: 'skis', ja: 'スキー'},
        {id: 'snowboard', ja: 'スノーボード'},
        {id: 'sports ball', ja: 'スポーツボール'},
        {id: 'kite', ja: 'カイト'},
        {id: 'baseball bat', ja: '野球バット'},
        {id: 'baseball glove', ja: '野球グローブ'},
        {id: 'skateboard', ja: 'スケートボード'},
        {id: 'surfboard', ja: 'サーフボード'},
        {id: 'tennis racket', ja: 'テニスラケット'},
        {id: 'bottle', ja: 'ボトル'},
        {id: 'wine glass', ja: 'ワイングラス'},
        {id: 'cup', ja: 'カップ'},
        {id: 'fork', ja: 'フォーク'},
        {id: 'knife', ja: 'ナイフ'},
        {id: 'spoon', ja: 'スプーン'},
        {id: 'bowl', ja: 'ボウル'},
        {id: 'banana', ja: 'バナナ'},
        {id: 'apple', ja: 'りんご'},
        {id: 'sandwich', ja: 'サンドイッチ'},
        {id: 'orange', ja: 'オレンジ'},
        {id: 'broccoli', ja: 'ブロッコリー'},
        {id: 'carrot', ja: 'にんじん'},
        {id: 'hot dog', ja: 'ホットドッグ'},
        {id: 'pizza', ja: 'ピザ'},
        {id: 'donut', ja: 'ドーナツ'},
        {id: 'cake', ja: 'ケーキ'},
        {id: 'chair', ja: '椅子'},
        {id: 'couch', ja: 'ソファ'},
        {id: 'potted plant', ja: '観葉植物'},
        {id: 'bed', ja: 'ベッド'},
        {id: 'dining table', ja: 'ダイニングテーブル'},
        {id: 'toilet', ja: 'トイレ'},
        {id: 'tv', ja: 'テレビ'},
        {id: 'laptop', ja: 'ノートパソコン'},
        {id: 'mouse', ja: 'マウス'},
        {id: 'remote', ja: 'リモコン'},
        {id: 'keyboard', ja: 'キーボード'},
        {id: 'cell phone', ja: '携帯電話'},
        {id: 'microwave', ja: '電子レンジ'},
        {id: 'oven', ja: 'オーブン'},
        {id: 'toaster', ja: 'トースター'},
        {id: 'sink', ja: '流し台'},
        {id: 'refrigerator', ja: '冷蔵庫'},
        {id: 'book', ja: '本'},
        {id: 'clock', ja: '時計'},
        {id: 'vase', ja: '花瓶'},
        {id: 'scissors', ja: 'はさみ'},
        {id: 'teddy bear', ja: 'テディベア'},
        {id: 'hair drier', ja: 'ヘアドライヤー'},
        {id: 'toothbrush', ja: '歯ブラシ'}
    ]
}; 