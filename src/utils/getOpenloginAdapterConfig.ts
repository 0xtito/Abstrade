export function getOpenloginAdapterConfig() {
  return {
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    network: "testnet",
    loginConfig: {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        verifier: "abstrade-google-0auth",
        name: "Google",
        typeOfLogin: "google",
      },
      discord: {
        clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        verifier: "abstrade-google",
        name: "Discord",
        typeOfLogin: "discord",
      },
    },
    uxMode: "popup",
  };
}
// google: {
//     clientId: (_c = process.env.REACT_APP_ZEROKIT_GOOGLE_CLIENT_ID) != null ? _c : "858644905236-j3v174qpg83pt1nkhb861l9up8762gnh.apps.googleusercontent.com",
//     name: "Google",
//     typeOfLogin: "google",
//     verifier: "zerokit-google"
//   },
