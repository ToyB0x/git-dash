import { Link } from "react-router";

export default function Page() {
  return (
    <ul className="list-disc">
      <li>
        <Link to="api-key" className="underline underline-offset-4">
          APIキーの発行
        </Link>
      </li>
      <li>
        <Link to="api-key" className="underline underline-offset-4">
          ワークスペースユーザ管理
        </Link>
      </li>
    </ul>
  );
}
