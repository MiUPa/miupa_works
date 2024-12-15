# メルカリShops宛名ラベル作成ツール

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

メルカリShopsの注文CSVから長形3号封筒用の宛名ラベルを作成するWebアプリケーションです。
ブラウザ上で動作し、サーバーへのアップロードは不要です。

## デモ

[デモサイトを見る](https://yourusername.github.io/mercari-print/)

![スクリーンショット](docs/images/screenshot.png)

## 特徴

- 📦 メルカリShopsの注文CSVに対応
- 🖨 長形3号封筒サイズの宛名ラベルを作成
- 📝 送り主情報の保存と読み込み
- 🔒 プライバシーに配慮（データはローカルのみで処理）
- 💻 モダンブラウザ対応
- 🎨 シンプルで使いやすいUI

## 使い方

1. 送り主情報の設定（以下のいずれかの方法で設定）
   
   A. フォームで直接入力
   - 画面上部の送り主情報フォームに必要事項を入力
   - 入力した情報は自動的にブラウザに保存され、次回アクセス時に自動読み込みされます
   
   B. CSVファイルから読み込み
   - 「テンプレートをダウンロード」リンクからCSVテンプレートをダウンロード
   - テンプレートに送り主情報を入力して保存
   - 「ファイルを選択」から保存したCSVファイルをアップロード

2. CSVファイルの準備
   - メルカリShopsの管理画面から注文CSVをダウンロード
   - ファイルの文字コードはUTF-8を推奨

3. ラベルの作成と印刷
   1. 「ファイルを選択」をクリックしてCSVファイルを選択
   2. データが表形式で表示されます
   3. 印刷したい宛名のチェックボックスにチェックを入れる（全選択も可能）
   4. 「選択したラベルを印刷」ボタンをクリック
   5. 印刷設定を確認
      - 用紙サイズ：A4
      - 印刷の向き：縦
      - 倍率：100%（実際のサイズ）
      - 余白：なし
   6. 印刷を実行

## 開発者向け情報

### プロジェクト構成

```
mercari-print/
├── src/
│   └── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── templates/
│       └── sender_template.csv
├── docs/
│   └── images/
│       └── screenshot.png
└── README.md
```

### 開発環境のセットアップ

1. リポジトリのクローン
   ```bash
   git clone https://github.com/yourusername/mercari-print.git
   cd mercari-print
   ```

2. 開発サーバーの起動
   ```bash
   # Python 3の場合
   python -m http.server 8000
   # または
   # Node.jsの場合
   npx http-server
   ```

3. ブラウザで http://localhost:8000/src/ にアクセス

### 開発モードについて

`assets/js/script.js`の先頭にある開発モードフラグで動作を切り替えできます：
```javascript
const isDevelopment = true;  // 開発中はtrue、本番環境ではfalseに変更
```

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 作者

Y.Miura - [@yourusername](https://github.com/yourusername)

## 謝辞

- このプロジェクトは個人的な学習とポートフォリオ用に作成されました
- メルカリShopsのサービスに感謝します
