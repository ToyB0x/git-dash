# WIP

# 前提知識

[About Github App installation access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app#about-installation-access-tokens)

# セキュリティについて

Personal Access Token (PAT) や 
Fine Grained Access Token も使えるが、
一部の機能はPATでは利用できないことや、Githubのデフォルト設定では組織のリソースに対しては
Fine Grained Access Token が利用できないようになっている。

また一般的にGithubアプリを利用してアクセスした方が安全性が高まることから、
組織ごとにGithubAppを作成した上で、分析処理を行う

ref:
- https://dev.classmethod.jp/articles/getting-an-access-token-with-only-the-necessary-permissions-on-github-appsgithub-actions/
