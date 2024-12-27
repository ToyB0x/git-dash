export const generateHash = async (token: string) => {
  // ref: https://stackoverflow.com/a/64795218
  // for security improvement, do not store the api token as plain text, hash it
  const hashBuffer = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    new TextEncoder().encode(token), // The data you want to hash as an ArrayBuffer
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  // convert bytes to hex string
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};
