import { TwitchAPIService } from "./services/TwitchAPIService.js";
import { textColor, speedSeconds, delaySeconds, refreshDataAfterMinutes } from "./config/config.js";
import sleep from "./utility/sleep.js";
//cant navigate between twitch and local app, redirect needs to be static
//middleware hosted on vertigodigital.se to pass token between twitch api and user

//initialize APIservice
const apiService = new TwitchAPIService();
await apiService.initAsync();

//change root css from config
document.documentElement.style.setProperty("--text-color", textColor);

//get followers async
const followers = await apiService.getFollowersAsync();

//request userimages async
const users = await Promise.all(
  followers.data.map(async (follower) => {
    const imgUrl = await apiService.getUserimageAsync(follower["user_id"]);
    return { name: follower["user_name"], imageUrl: imgUrl };
  })
);

//get app wrapper
const app = document.getElementById("app");
const title = document.getElementById("title");

//outer container
const container = () => {
  const div = document.createElement("div");
  div.classList.add("container");
  div.classList.add("deactivated");
  return div;
};

const userDiv = () => {
  const div = document.createElement("div");
  div.classList.add("user");
  return div;
};

// text
const text = (user) => {
  const div = document.createElement("div");
  div.classList.add("letter-container");
  for (let i = 0; i < user.name.length; i++) {
    const p = document.createElement("p");
    p.innerText = user.name[i];
    p.classList.add("name");
    div.appendChild(p);
  }
  return div;
};

// img
const img = (user) => {
  const img = document.createElement("img");
  img.src = user.imageUrl;
  return img;
};

//create document
users.forEach((user) => {
  const _container = container();
  const _userDiv = userDiv();
  const _text = text(user);
  const _img = img(user);

  _userDiv.appendChild(_text);
  _userDiv.appendChild(_img);
  _container.appendChild(_userDiv);
  app.appendChild(_container);
});

//animations
const divBounce = [{ opacity: "0" }, { opacity: "1" }];
const imageBounce = [{ transform: "scale(0)" }, { transform: "scale(1)" }];
const textBounceIn = [
  { transform: "scale(0) rotateZ(-90deg) translateY(600%)" },
  { transform: "scale(1) rotateZ(0deg)" },
];
const textBounceOut = [
  { transform: "scale(1) " },
  { transform: "scale(0)  translateY(100%) rotateZ(-90deg)" },
];
const textBounceOut2 = [
  { transform: "scale(1) " },
  { transform: "scale(0)  translateY(-100%) rotateZ(90deg)" },
];

//animation loop
let counter = 0;
const animationLoop = () => {
  if (counter == 0) {
    
    title.classList.add("activated");
    title.classList.remove("deactivated");
    console.log(title);
  }

  //get current element
  const element = app.children[counter];
  element.classList.add("activated");
  element.classList.remove("deactivated");

  //get elements
  const textHTML = element.querySelector(".letter-container");
  const imgHTML = element.querySelector("img");

  //animate div in
  element.animate(divBounce, {
    duration: 500,
    iterations: 1,
    fill: "forwards",
  });

  //animate image in
  imgHTML.animate(imageBounce, {
    duration: 2000,
    iterations: 1,
    easing: "cubic-bezier(0.47, 1.64, 0.41, 0.8)",
    fill: "forwards",
  });

  //letters animation
  for (let i = 0; i < textHTML.children.length; i++) {
    const letter = textHTML.children[i];
    let snapshot = document.timeline.currentTime;
    const animation = letter.animate(textBounceIn, {
      duration: 1000,
      iterations: 1,
      easing: "cubic-bezier(0.47, 1.64, 0.41, 0.8)",
      fill: "forwards",
    });
    animation.pause();
    animation.startTime = snapshot + i * 100;
    //if last letter, listen for finishing event
    if (i == textHTML.children.length - 1) {
      animation.addEventListener("finish", () => {
        //animate out loop

        //animate image in
        imgHTML.animate(imageBounce, {
          duration: 2000,
          iterations: 1,
          easing: "cubic-bezier(0.47, 1.64, 0.41, 0.8)",
          direction: "reverse",
          fill: "forwards",
        });

        snapshot = document.timeline.currentTime + speedSeconds * 1000;
        for (let j = 0; j < textHTML.children.length; j++) {
          const _letter = textHTML.children[j];
          const _animation = _letter.animate(j % 2 == 0 ? textBounceOut : textBounceOut2, {
            duration: 1000,
            iterations: 1,
            easing: "cubic-bezier(0.47, 1.64, 0.41, 0.8)",
            fill: "forwards",
          });
          _animation.pause();
          _animation.startTime = snapshot + j * 100;
          if (j == textHTML.children.length - 1) {
            _animation.addEventListener("finish", async () => {
              if (counter < app.children.length - 1) {
                counter++;
              } else {
                counter = 0;
                title.classList.add("deactivated");
                title.classList.remove("activated");
                await sleep(delaySeconds * 1000);
              }
              animationLoop();
            });
          }
        }
      });
    }
  }
};

animationLoop();
setTimeout(() => {
  window.location.reload();
}, refreshDataAfterMinutes * 1000 * 60);
