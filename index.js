const express = require("express");
const axios = require("axios").default;
require("dotenv").config();

// const LinkedIn = require("linkedin-api-wrapper");

const app = express();
const port = process.env.PORT;

// const BASE_URL = process.env.DEV_URL;
const BASE_URL = process.env.PROD_URL;

let access_token = "";
let name = "";
let id = "";

// const linkedin = LinkedIn({
//   access_token: auth_token,
// });

// https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=process.env.CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%${3Aprocess.env.PORT}%`Fcallback&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_socil
// http%3A%2F%2Flocalhost%${3Aprocess.env.PORT}%`Fcallback

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
    res.redirect(BASE_URL);
  }

  res.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${BASE_URL}/callback&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`
  );
});

app.get("/callback", function (req, res) {
  console.log("code: ", req.query.code);
  console.log("state: ", req.query.state);

  if (access_token) {
    res.redirect(BASE_URL);
  }

  axios
    .request({
      url: `https://www.linkedin.com/oauth/v2/accessToken`,
      method: "post",
      params: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: `${BASE_URL}/callback`,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
    })
    .then((response) => {
      console.log("object");
      console.log(response.data);

      access_token = response.data.access_token;
      if (access_token) {
        res.redirect(BASE_URL);
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(port, () => {
  console.log(`Postink listening on port: ${port}`);
});

// app.close()
