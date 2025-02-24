const siteConfig = {
    author: {
        name: 'MiUPa',
        title: 'Web Developer & Software Engineer',
        description: 'Web開発とソフトウェアエンジニアリングを専門とするエンジニアです。あったら便利なツールの開発が趣味です。'
    },
    skills: [
        { category: 'Frontend', items: 'HTML, CSS, JavaScript' },
        { category: 'Backend', items: 'Python, Node.js' },
        { category: 'Tools', items: 'Git, Docker' },
        { category: 'Other', items: 'UI/UX Design, Responsive Web Design' }
    ],
    projects: [
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