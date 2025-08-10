const siteConfig = {
    author: {
        name: 'MiUPa',
        title: 'Web Developer & Software Engineer',
        description: '1992-. 用水路の観察が趣味です。'
    },
    projects: [
        {
            title: '絵心チェッカー',
            description: 'AIがあなたの絵の上手さを判定！出題されるお題に合わせて絵を描き、カメラに映すだけの簡単絵心テスト。TensorFlow.jsを活用したブラウザで動作するゲームアプリ。',
            image: 'assets/images/egokoro-checker.png',
            demoUrl: 'projects/egokoroChecker/',
            technologies: ['HTML', 'CSS', 'JavaScript', 'TensorFlow.js', 'COCO-SSD']
        },
        {
            title: 'みまもりAI',
            description: 'TensorFlow.jsとCOCO-SSDモデルを使用したリアルタイム物体検出Webアプリケーション。カメラを通じて人や物体をリアルタイムで検出します。',
            image: 'assets/images/mimamori-ai.png',
            demoUrl: 'projects/MimamoriAI/',
            technologies: ['HTML', 'CSS', 'JavaScript', 'TensorFlow.js', 'COCO-SSD']
        },
        {
            title: 'メルカリShops宛名ラベル作成ツール',
            description: 'メルカリShopsの注文CSVから長形3号封筒用の宛名ラベルを作成するWebアプリケーション。',
            image: 'assets/images/mercari-print.png',
            demoUrl: 'projects/mercari-print/src/',
            technologies: ['HTML', 'CSS', 'JavaScript']
        },
        {
            title: '投資コーチ（Invest Coach）',
            description: '投資学習とポートフォリオ管理を支援するWebアプリケーション。資産配分、モデリング、目標達成の可視化などを提供。',
            image: 'assets/images/invest-coach.svg',
            demoUrl: 'http://invest-coach.miupa.jp/',
            technologies: ['HTML', 'CSS', 'JavaScript']
        }
    ],
    social: {
        github: 'https://github.com/MiUPa',
        twitter: 'https://x.com/MiUPa'
    },
    copyright: {
        year: new Date().getFullYear(),
        holder: 'MiUPa'
    }
}; 