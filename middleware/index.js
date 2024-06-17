import readCookie from "./readCookie.js";

// if redir doesnt exist, we're here for the first time
const cookie = readCookie("redirect");

if (cookie == undefined || null) {
  const params = new URLSearchParams(window.location.search);

  const redirect = params.get("redirect");
  const app = params.get("app");
  const scope = encodeURIComponent(params.get("scope"));
  const responseType = "token";
  const location = "https://twitch-token-middleware.vertigodigital.se/index.html";

  //set cookie to redirect back to original page
  document.cookie = "redirect=" + redirect;

  //build twitch url
  const url = `https://id.twitch.tv/oauth2/authorize?client_id=${app}&redirect_uri=${location}&response_type=${responseType}&scope=${scope}`;
  window.location.href = url;
} else {
  //delete cookie
  document.cookie = "redirect=; Max-Age=0;";
  //read hash
  const url = new URL(window.location);
  //skip hashtag with substr
  const hash = url.hash.substring(1);
  const parsedHash = new URLSearchParams(hash);
  const parsedToken = parsedHash.get("access_token");
  //add to url,bugfix, and redirect
  let newUrl = `${cookie}index.html?token=${parsedToken}`;
  window.location = newUrl;
}
