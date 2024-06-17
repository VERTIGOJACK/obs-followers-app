import { appID, userName, followersAmount } from "./config/config.js";
import readCookie from "./readCookie.js";
import dateAdd from "./dateAdd.js";

export class TwitchAPIService {
  constructor() {
    this.token = undefined;
    this.broadCasterID = undefined;
  }

  // initialize
  initAsync = async () => {
    await this.getUserToken();
    await this.getBroadcasterID();
  };

  getUserToken = async () => {
    this.token = readCookie("user-token");
    //if there is no token, run get token flow
    if (this.token == (null || undefined)) {
      //check if redirected already
      if (document.location.hash != "") {
        const url = new URL(window.location);
        //skip hashtag with substr
        const hash = url.hash.substring(1);
        const parsedHash = new URLSearchParams(hash);
        const parsedToken = parsedHash.get("access_token");
        //save to cookie and token
        document.cookie = "user-token=" + parsedToken;
        this.token = parsedToken;
      } else {
        //save current location
        const redirectLocation = "http://localhost:5500";

        //scopes is space delimited, and needs html encode
        const scopes = "moderator:read:followers";
        const scopesHTML = encodeURIComponent(scopes);

        //response type
        const responseType = "token";

        //build url
        const url = `https://id.twitch.tv/oauth2/authorize?client_id=${appID}&redirect_uri=${redirectLocation}&response_type=${responseType}&scope=${scopesHTML}`;
        window.location.href = url;
      }
    }
  };

  getBroadcasterID = async () => {
    //construct url
    const url = "https://api.twitch.tv/helix/users?login=" + userName;
    const headers = { headers: { Authorization: "Bearer " + this.token, "Client-Id": appID } };

    // request endpoint
    const res = await fetch(url, headers);

    //convert to json
    const json = await res.json();

    this.broadCasterID = json.data[0].id;
  };

  getFollowersAsync = async () => {
    //construct url
    const url =
      "https://api.twitch.tv/helix/channels/followers?broadcaster_id=" + this.broadCasterID;

    // request endpoint
    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + this.token,
        "Client-Id": appID,
      },
    });

    //convert to json
    const json = await res.json();
    return json;
  };
}

const createExpiryDate = () => {
  //set to expire in 4 hours
  const expiry = dateAdd(new Date(), "hour", 4);
  const expiryUTC = expiry.toUTCString();
  return expiryUTC;
};
