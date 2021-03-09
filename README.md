# image-capture
アプリケーション、モニターなどから画面キャプチャーを切り抜くことができるツールです。
切り抜いた画像どうしを重ねて比較したり、切り抜いた画像と元の画面とを重ねて比較することができます。

サイト→https://www.ajizablg.com/image-capture/index.html

## ビルド方法
### 前提
- [Node.js](https://nodejs.org/ja/)をインストールしてください

### 手順
別リポジトリ[vncho-lib](https://github.com/st-user/vncho-lib)の共通ライブラリに依存しているので、その共通ライブラリを先にクローンしてから、ビルドします。

```
git clone https://github.com/st-user/vncho-lib.git
cd vncho-lib
npm install
npm run build-css
cd ../

git clone https://github.com/st-user/image-capture.git
cd image-capture
npm install
npm run clean
npm run build-css
npm run start
```

gitをインストールしていない場合、zipをダウンロードし、同様に上記コマンドを実行してください。

以上により、`http://localhost:8080/image-capture/index.html`にアクセスできるようになります。
プロダクション版（ウェブサーバーのドキュメントルートなどに配置する版）をビルドする場合は
```
npm run clean
npm run build
npm run license-gen
```
を実行してください。
### ライセンス
ソースコードのライセンスは[LICENSE](https://github.com/st-user/image-capture/blob/main/LICENSE)記載の通りMITですが、[assets](https://github.com/st-user/image-capture/tree/main/assets)に配置するicon,logoについては、許可なく利用することを禁止します。
