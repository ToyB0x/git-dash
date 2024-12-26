# git-dash

This is a git analysis tool.

# Project Status

Currently, the sample implementation as Proof of Concept has been completed.  
We are working on the practical implementation.

# Github Actions

We currently provide Github Actions with the following features:  
(Includes implementation in progress)

- Collect repository activity: WIP
- Report activity to backend server (for displaying UI in browser): WIP

# Development Workflow

1. Add Schema file (packages/schema)
2. Add Query file (apps/job)
3. Add API file (apps/api)
4. Add UI file (apps/web)

# Architecture

WIP

# Pricing

Currently, this project offers free services as a proof of concept.  
(All plans are free and may continue for the next 6 months/year)

In the future, we plan to offer paid managed services in the cloud.  
(We will also offer discounts for early access users.)

And Merged PR creators will be given a discount on the paid plan.
(Details will be announced later)

# TODO

- 全体的に不要なグラフがないか確認する
- 全体的にページごとの少しだけのアクセント、差別化を追加・検討する
- 全体的にどのグラフが再利用可能か確認する
- Add site meta title
- モバイル版の不具合を探す
- Jobs v2 のTODOコメントを総点検(一定程度のワークアラウンドを利用してしまっているため)
- Root Layout 用のRootサイドバーUIを追加する
- Organization > Workspace の階層構造を作る
- 以下理由からGithubアプリへの対応を進める
  - fine-grainedトークンはデフォルトで組織へのアクセスができない
  - classicトークンはデフォルトで組織へのアクセスができるが、将来廃止されるかもしれない & 設定でアクセスを無効化できる
  - Githubアプリか敢えて追加で組織に許可されたfine-grainedトークンしかBillingにアクセスできない
- 顧客ごとにGithubアプリを作ってもらう運用のドキュメントを書く
- Fetch機能のResumeを可能とする
- プロダクション環境またはSTG環境またはDEV環境をセットアップして運用を開始する(Firebaseのセットアップが必要かもしれない)
- 全体的にTODOコメント部分を再確認する
- 過去のコストも見れるようにする
- sql.jsのデータロードでなるべくキャッシュを利用するにようにする
- workflowRunがQuotaとDB容量を使いすぎるので、擬似的にusageの日時差分で、日時の積算を計算することを検討  
  (ただし、日時差分とする場合はクエリ実行時刻の影響を受けることに注意)
- PRテーブルのファイルサイズを削減する
　`SELECT name, sum(pgsize) AS size FROM dbstat GROUP BY name ORDER BY size DESC LIMIT 10;`
- 現在の簡易実装であるAPIキーをよりセキュアにするためハッシュ化したデータを保存するようにする(ハッシュ計算元はどこにも保存しない)
- Usersページをアルファベット順でソートする & テーブル自体にブラウザ上のソート機能を追加
