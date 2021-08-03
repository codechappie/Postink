const express = require("express");
const axios = require("axios").default;
const LinkedIn = require("linkedin-api-wrapper");

const app = express();
const port = 3001;

let access_token = "";
let name = "";
let id = "";

// const linkedin = LinkedIn({
//   access_token: auth_token,
// });

// https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78zj5z75j2zjcm&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social
// http%3A%2F%2Flocalhost%3A3001%2Fcallback

app.get("/profile", (req, res) => {
  res.send(`Hola ${name}`);
});

app.get("/sharepost", (req, res) => {
  console.log(access_token);
  axios
    .request({
      url: `https://api.linkedin.com/v2/ugcPosts?oauth2_access_token=${access_token}`,
      method: "POST",
      params: {},
      data: {
        author: `urn:li:person:${id}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: "🔥 Hello world!!",
            },
            shareMediaCategory: "ARTICLE",
            media: [
              {
                status: "READY",
                description: {
                  text: `Official LinkedIn Blog - Your source for insights and information about LinkedIn.`,
                },
                originalUrl: "https://codechappie.com/",
                title: {
                  text: "Official LinkedIn Blog",
                },
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
    })
    .then((response) => {
      console.log(response.data);
      return res.send("publicado");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/", (req, res) => {
  if (access_token) {
    axios
      .get(`https://api.linkedin.com/v2/me?oauth2_access_token=${access_token}`)
      .then((response) => {
        console.log(response.data);
        res.send(`Hola ${response.data.localizedLastName}`);
        name = response.data.localizedLastName;
        id = response.data.id;
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    res.send("inicia sesion");
  }
});

app.get("/login", (req, res) => {
  if (access_token !== "") {
    res.redirect("http://localhost:3001/");
  }

  res.redirect(
    "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78zj5z75j2zjcm&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social"
  );
});

app.get("/callback", function (req, res) {
  console.log("code: ", req.query.code);
  console.log("state: ", req.query.state);

  if (access_token) {
    res.redirect("http://localhost:3001/");
  }

  axios
    .request({
      url: `https://www.linkedin.com/oauth/v2/accessToken`,
      method: "post",
      params: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: "http://localhost:3001/callback",
        client_id: "78zj5z75j2zjcm",
        client_secret: "xfilpbu8WGBmVmcr",
      },
    })
    .then((response) => {
      console.log("object");
      console.log(response.data);

      access_token = response.data.access_token;
      if (access_token) {
        res.redirect("http://localhost:3001/");
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// app.close()
