import { appID } from "../config/config.js";
import readCookie from "../utility/readCookie.js";

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

  //will read token from cookie, or run flow to aquire token.
  getUserToken = async () => {
    this.token = readCookie("user-token");
    //if there is no token, run get token flow
    if (this.token == (null || undefined)) {
      const hash = document.location.hash.substring(1) ?? null;
      if (hash) {
        const parsedHash = new URLSearchParams(hash);
        const parsedToken = parsedHash.get("access_token");
        //save to cookie and token
        document.cookie = "user-token=" + parsedToken;
        this.token = parsedToken;
      }

      //scopes is space delimited, and needs html encode
      const scopes = "moderator:read:followers";

      const paramsObj = {
        client_id: appID,
        response_type: "token",
        redirect_uri:
          "https://local.vertigodigital.net:4390/widgets/obs-followers-app",
        scope: scopes,
      };
      const params = new URLSearchParams(paramsObj);
      window.location.href =
        "https://id.twitch.tv/oauth2/authorize?" + params.toString();
    }
  };

  getBroadcasterID = async () => {
    //construct url
    const url = "https://api.twitch.tv/helix/users";
    const headers = {
      headers: { Authorization: "Bearer " + this.token, "Client-Id": appID },
    };

    // request endpoint
    const res = await fetch(url, headers);

    checkforTokenError(res);

    //convert to json
    const json = await res.json();
    this.broadCasterID = json.data[0].id;
  };

  getFollowersAsync = async () => {
    //construct url
    const url =
      "https://api.twitch.tv/helix/channels/followers?broadcaster_id=" +
      this.broadCasterID;

    // request endpoint
    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + this.token,
        "Client-Id": appID,
      },
    });

    checkforTokenError(res);

    //convert to json
    const json = await res.json();
    return json;
  };

  getUserimageAsync = async (userId) => {
    //construct url
    const url = "https://api.twitch.tv/helix/users?id=" + userId;

    // request endpoint
    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + this.token,
        "Client-Id": appID,
      },
    });

    checkforTokenError(res);

    //convert to json
    const json = await res.json();
    return json.data[0]["profile_image_url"];
  };
}

const checkforTokenError = (response) => {
  if (response.status == "401") {
    //remove cookie and refresh page
    document.cookie = "user-token=; Max-Age=0;";
    window.location.reload();
  }
};
