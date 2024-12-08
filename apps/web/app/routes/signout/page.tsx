import { signOut } from "firebase/auth";
import { auth } from "~/.client";

export default function Page() {
  return (
    <button
      type="submit"
      onClick={async () => {
        await signOut(auth);
      }}
    >
      sign out
    </button>
  );
}
