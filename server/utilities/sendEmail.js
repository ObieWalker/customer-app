const sendGrid = require("sendgrid").mail;
const emailVerificationOptions = require("../constants/emailVerificationOptions");
const sg = require("sendgrid")(emailVerificationOptions.SEND_GRID_API_KEY);
const fs = require("fs");
var jwt = require("jsonwebtoken");
var secretKey = require("../constants/jwtOptions");
const SiteLinks = require("../constants/SiteLink").siteLinks;

class sendEmail {
  constructor() {
    this.data = {};
    this.attachments = null;
    this.templatePath = null;
    this.subject = "Turing Daily Standup Invitation";
    this.senderName = "Turing Daily Standup";
  }
  template(path) {
    this.templatePath = "./template/" + path;
    return this;
  }
  setData(data) {
    this.data = data;
    return this;
  }
  setSubject(subject) {
    this.subject = subject;
  }
  setAttachments(attachments) {
    this.attachments = attachments;
  }
  sendTo(email) {
    return new Promise((resolve, reject) => {
      fs.readFile(this.templatePath, "utf8", (err, mailBody) => {
        if (err) {
          console.log(err);
        } else {
          const request = sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: {
              personalizations: [
                {
                  to: [{ email }],
                  subject: this.subject,
                  substitutions: this.data
                }
              ],
              from: { email: "no-reply@turing.com", name: this.senderName },
              content: [
                {
                  type: "text/html",
                  value: mailBody
                }
              ],
              attachments: this.attachments
            }
          });
          sg.API(request, (error, response) => {
            if (error) {
              console.log("sendgriderror", error);
              return reject(error);
            } else {
              return resolve(response);
            }
          });
        }
      });
    });
  }
}

function sendEmailCustomerInvitation(name, email, password) {
  return (new sendEmail())
    .template("CustomerInvitation/CustomerInvitationTemplate.html")
    .setData({
      '%LOGIN%': email,
      '%NAME%': name,
      '%PASSWORD%': password
    })
    .sendTo(email);
}

function sendStandupNotificationEmails(devId, customerId, standupId, devName, answers, tasks, estimates, initialTasks, completes, mailListTPM, mailListCustomer, driEmail) {
  var [yesterday, today, blockers] = answers.split(',');
  var completeTasks = completes.replace(/,/g, '\n');
  var plans = tasks.split(',');
  var planEstimates = String(estimates).split(',');
  var planTextToDisplay = '';

  // SET THE HEADER FOR PLANS
  planTextToDisplay += (
    `<tr align='left'>
      <th style='font-family: ArialMT, Arial, sans-serif; width: 600px;'><p style='color:#696969;'>Task Name</p></th>
      <th style='width: 250px;'><p style='color:#696969;'>Estimated Hours</p></th>
    </tr>`
  );

  // POPULATE THE CONTENT OF PLANS
  var tropen = '<tr align=\'left\'>';
  var trclose = '</tr>';
  for (var i = 0; i < plans.length; i++) {
    var title = `<td style=\'font-family:ArialMT, Arial, sans-serif;width:600px;\'><p>${plans[i]}</p></td>`;
    var number = `<td style=\'width:250px;\'><p>${planEstimates[i]}</p></td>`;

    planTextToDisplay += tropen + title + number + trclose;
  }

  var mail = new sendEmail();
  mail.template("standupNotification/standupNotificationTemplate.html");

  /* SUBJECT = Name + Date +First plan tasks */
  var currentDate = new Date();
  var currentDateText = currentDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  var firstTask = tasks.split(',')[0];
  firstTask = firstTask.substring(0, 100).replace(/&#44;/g, ",");
  var subject = `${devName}\'s Daily Standup- ${firstTask} ...`;

  mail.setSubject(subject);

  /*Emotion image*/

  var emotionLst = [
    {name:"Not Happy", cid: "nothappy", res: `${SiteLinks.PROD_LINK}img/NotHappy_Icon.png` },
    {name:"Okay", cid: "okay", res: `${SiteLinks.PROD_LINK}img/OK_Icon.png` },
    {name:"Good", cid: "good", res: `${SiteLinks.PROD_LINK}img/Good_Icon.png` },
    {name:"Great", cid: "great", res: `${SiteLinks.PROD_LINK}img/Great_Icon.png` }
  ];

  var attachLinks = [];

  for (var i = 0; i < emotionLst.length; i++) {

    var feedbackLink = `${SiteLinks.PROD_LINK}customer/submit/feedback?feedbacktoken=`;
    var feedBackData = {devId:devId, customerId:customerId,standupId:standupId, feedbackPublicLink: true, feedbackValue: i };
    var token = jwt.sign(
      { feedBackData },
      secretKey.jwtOptions.secretOrKey,
      { expiresIn: "1 day" }
    );

    var tokenLink = `${feedbackLink}${token}`;
    attachLinks.push(
      `<a href="${tokenLink}"><div style="
      width:90px;
      text-align:center;
      display:block;
      background-color: transparent;
      border: 1px solid transparent;
      margin-right: 1px;
      margin-bottom: 1px;
      float:left;" ><img src="${emotionLst[i].res}" height="42" width="42"/><p >${emotionLst[i].name}</p></div></a>`
    );
 }

       /* DATA */
  mail.setData({
         "%NAME%": devName,
         "%YESTERDAY%": yesterday,
         "%TODAY%": today,
         "%BLOCKERS%": blockers,
         "%COMPLETES%": completes,
         "%PLANS%": planTextToDisplay,
         "%DATE%": currentDateText,
         "%NOTHAPPY%": attachLinks[0],
         "%OKAY%": attachLinks[1],
         "%GOOD%": attachLinks[2],
         "%GREAT%": attachLinks[3]
       });

      /* SEND TO DRI */
      if(driEmail) mail.sendTo(driEmail);

      /* SEND TO MAIL LIST */
      if(mailListTPM) {
        var mailList1 = mailListTPM.split(",");
        for (var i = 0; i < mailList1.length; i++) {
          mail.sendTo(mailList1[i]);
          //console.log('Send mail to:', mailList1[i]);
        }
      }

      if(mailListCustomer) {
          var mailList2 = mailListCustomer.split(",");
          for (var i = 0; i < mailList2.length; i++) {
            mail.sendTo(mailList2[i]);
            //console.log('Send mail to:', mailList2[i]);
          }
      }
}


module.exports = {
  sendEmailCustomerInvitation,
  sendStandupNotificationEmails
};
