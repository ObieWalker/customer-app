const sendGrid = require("sendgrid").mail;
const emailVerificationOptions = require("../constants/emailVerificationOptions");
const sg = require("sendgrid")(emailVerificationOptions.SEND_GRID_API_KEY);
const fs = require('fs');
let mailBody;

fs.readFile('template/emailTemplate.html', 'utf8', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    mailBody = data;
  }
});


const sendVerificationEmail = (to, token) => {
  //const hostUrl = emailVerificationOptions.CLIENT_URL;
  const request = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: {
      personalizations: [
        {
          to: [
            {
              email: to
            }
          ],
          subject: "Turing Daily Standup | Verify Your Email",
          substitutions: {
            '%TOKEN%': token,
            '%EMAIL_TO%': to
          }
        }
      ],
      from: {
        email: "no-reply@turing.com"
      },
      content: [
        {
          type: "text/html",
          value: mailBody
        }
      ]
    }
  });
  return new Promise(function (resolve, reject) {
    sg.API(request, function (error, response) {
      if (error) {
        console.log("sendgriderror", error);
        return reject(error);
      } else {
        return resolve(response);
      }
    });
  });
};

module.exports = {
  sendVerificationEmail: sendVerificationEmail
};
