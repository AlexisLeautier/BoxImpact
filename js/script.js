function onSignIn(googleUser) {

  // Useful data for your client-side scripts:
  var profile = googleUser.getBasicProfile();
  // console.log("ID: " +
  //             profile.getId()); // Don't send this directly to your server!
  // console.log('Full Name: ' + profile.getName());
  // console.log('Given Name: ' + profile.getGivenName());
  // console.log('Family Name: ' + profile.getFamilyName());
  // console.log("Image URL: " + profile.getImageUrl());
  // console.log("Email: " + profile.getEmail());

  var name = profile.getName();
  var givenName = profile.getGivenName();
  document.getElementById("welcome-text").innerHTML = "Welcome \n" + givenName;
  var familyName = profile.getFamilyName();
  var imageUrl = profile.getImageUrl();
  var email = profile.getEmail();

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  // console.log("ID Token: " + id_token);

  // Compute email statistics
  computeEmailStatistics(email);

  // Remove element
  var rm_services = document.getElementById("services-menu-item");
  rm_services.parentNode.removeChild(rm_services);
  var rm_contact = document.getElementById("contact-menu-item");
  rm_contact.parentNode.removeChild(rm_contact);

  // Add elements to menu
  var add_portfolio = document.createElement('li');
  add_portfolio.innerHTML = '<a href="#portfolio">Welcome</a>';
  add_portfolio.setAttribute('id', "portfolio-menu-item");
  document.getElementById("main-menu-list").appendChild(add_portfolio);
  var add_about = document.createElement('li');
  add_about.innerHTML = '<a href="#about">About</a>';
  add_about.setAttribute('id', "about-menu-item");
  document.getElementById("main-menu-list").appendChild(add_about);
  var add_news = document.createElement('li');
  add_news.innerHTML = '<a href="#news">News</a>';
  add_news.setAttribute('id', "news-menu-item");
  document.getElementById("main-menu-list").appendChild(add_news);
  var add_video = document.createElement('li');
  add_video.innerHTML = '<a href="#video">Video</a>';
  add_video.setAttribute('id', "video-menu-item");
  document.getElementById("main-menu-list").appendChild(add_video);
  var add_skills = document.createElement('li');
  add_skills.innerHTML = '<a href="#skills">Skills</a>';
  add_skills.setAttribute('id', "skills-menu-item");
  document.getElementById("main-menu-list").appendChild(add_skills);
  var add_contact = document.createElement('li');
  add_contact.innerHTML = '<a href="#contact">Contact</a>';
  add_contact.setAttribute('id', "contact-menu-item");
  document.getElementById("main-menu-list").appendChild(add_contact);

  // Make other sections visible
  document.getElementById("services").style.display = "none";
  document.getElementById("portfolio").style.display = "block";
  document.getElementById("about").style.display = "block";
  document.getElementById("news").style.display = "block";
  document.getElementById("video").style.display = "block";
  document.getElementById("skills").style.display = "block";
  document.getElementById("signin-button").style.display = "none";
  document.getElementById("signout-link").style.display = "block";
  document.getElementById("email-stats").innerHTML = "";

  // Scroll to the next section
  document.getElementById('portfolio')
      .scrollIntoView({block : 'start', behavior : 'smooth'});
}

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth, 1);
}

function checkAuth() {
  gapi.auth.authorize({client_id : clientId, scope : scopes, immediate : true},
                      handleAuthResult);
}

function handleAuthClick() {
  gapi.auth.authorize({client_id : clientId, scope : scopes, immediate : false},
                      handleAuthResult);
  return false;
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    loadGmailApi();
    $('#authorize-button').remove();
    $('.table-inbox').removeClass("hidden");
  } else {
    $('#authorize-button').removeClass("hidden");
    $('#authorize-button').on('click', function() { handleAuthClick(); });
  }
}

function loadGmailApi() { gapi.client.load('gmail', 'v1', displayInbox); }

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log('User signed out.');

    // Remove element
    var rm_portfolio = document.getElementById("portfolio-menu-item");
    rm_portfolio.parentNode.removeChild(rm_portfolio);
    var rm_about = document.getElementById("about-menu-item");
    rm_about.parentNode.removeChild(rm_about);
    var rm_news = document.getElementById("news-menu-item");
    rm_news.parentNode.removeChild(rm_news);
    var rm_video = document.getElementById("video-menu-item");
    rm_video.parentNode.removeChild(rm_video);
    var rm_skills = document.getElementById("skills-menu-item");
    rm_skills.parentNode.removeChild(rm_skills);
    var rm_contact = document.getElementById("contact-menu-item");
    rm_contact.parentNode.removeChild(rm_contact);

    // Add elements to menu
    var add_services = document.createElement('li');
    add_services.innerHTML = '<a href="#services">Why</a>';
    add_services.setAttribute('id', "services-menu-item");
    document.getElementById("main-menu-list").appendChild(add_services);
    var add_contact = document.createElement('li');
    add_contact.innerHTML = '<a href="#contact">Contact</a>';
    add_contact.setAttribute('id', "contact-menu-item");
    document.getElementById("main-menu-list").appendChild(add_contact);

    document.getElementById("services").style.display = "block";
    document.getElementById("portfolio").style.display = "none";
    document.getElementById("about").style.display = "none";
    document.getElementById("news").style.display = "none";
    document.getElementById("video").style.display = "none";
    document.getElementById("skills").style.display = "none";
    document.getElementById("signin-button").style.display = "block";
    document.getElementById("signout-link").style.display = "none";
  });
}

function computeEmailStatistics(email) {
  // Get list of messages
  gapi.client.load('gmail', 'v1', listMessages);

  // var messagesSize = messageResp.resultSizeEstimate;
}

async function listMessages() {

  const stringArray = await getEmailStatString();

  const result = await printOutput(stringArray, "email-stats");
}

function printOutput(stringArray, id) {
  return new Promise(resolve => {
    document.getElementById(id).innerHTML = "";
    for (i = 0; i < stringArray.length; i++) {
      document.getElementById(id).innerHTML += stringArray[i];
    }
    resolve(stringArray);
  });
}

// function listMessagesWithQuery(email, query, callback) {
//   var getPageOfMessages = function(request, result) {
//     request.execute(function(resp) {
//       result = result.concat(resp.messages);
//       var nextPageToken = resp.nextPageToken;
//       if (nextPageToken) {
//         request = gapi.client.gmail.users.messages.list(
//             {'userId' : email, 'pageToken' : nextPageToken, 'q' : query});
//         getPageOfMessages(request, result);
//       } else {
//         callback(result);
//       }
//     });
//   };
//   var initialRequest =
//       gapi.client.gmail.users.messages.list({'userId' : email, 'q' : query});
//   getPageOfMessages(initialRequest, []);
// }

async function countMessagesInSizeRange(lowerSize, upperSize) {
  var stringSizeQuery = '';
  var stringSizeRange = '';
  if (lowerSize !== '') {
    stringSizeQuery += 'larger_than:' + lowerSize;
    stringSizeRange += 'From ' + lowerSize;
  } else {
    stringSizeRange += 'Up';
  }
  if (upperSize !== '') {
    stringSizeQuery += ' smaller_than:' + upperSize;
    stringSizeRange += ' to ' + upperSize;
  }
  stringSizeRange += ': ';

  var messagesLength = 0;
  var messageString = "";
  var request =
      await gapi.client.gmail.users.messages
          .list({
            'userId' : 'me',
            'includeSpamTrash' : true,
            'q' : stringSizeQuery
          })
          .then(
              async function(response) {
                var messages = response.result.messages;
                var messagesLength = 0;
                if (response.result.resultSizeEstimate > 0) {
                  messagesLength = messages.length;
                }
                messageString =
                    await '<span style="color: #e54b76;"><strong>' +
                    stringSizeRange +
                    '<strong></span> <span style="color:#727190;"><em>' +
                    messagesLength + '</em></span><br>';
                // document.getElementById("email-stats").innerHTML +=
                // localOutput;
              },
              function(err) { console.error("Execute error", err); });

  return [ messagesLength, messageString ];
}

async function getEmailStatString() {
  var stringOutput = new Array(7);
  // var request =
  //     await gapi.client.gmail.users.messages
  //         .list({'userId' : 'me', 'includeSpamTrash' : true})
  //         .then(
  //             function(response) {
  //               var result = response.result;
  //               var messages = result.messages;
  //               stringOutput[0] =
  //                   "<br>There are currently " + messages.length +
  //                   " messages in your inbox, with the following size
  //                   repartition: ";
  //             },
  //             function(err) { console.error("Execute error", err); });

  var totalSize = 0;
  var messagesCount = 0;
  // Get number of messages within size brackets to estimate size
  var lowerBounds = [ '', '250K', '500K', '1M', '2M', '5M' ];
  var upperBounds = [ '250K', '500K', '1M', '2M', '5M', '' ];
  var messageAverageSizes = [ 125, 375, 750, 1500, 3500, 10000 ];

  for (let i = 0; i < 6; i++) {
    var messageOutput =
        await countMessagesInSizeRange(lowerBounds[i], upperBounds[i]);

    let getFields = new Promise(resolve => {
      console.log("message" + i, messageOutput);
      totalSize += messageOutput[0] * messageAverageSizes[i];
      messagesCount += messageOutput[0];
      stringOutput[i] = messageOutput[1];
      resolve();
    });
    await getFields;
  }
  let fillIntroOutro = new Promise(resolve => {
    stringOutput[0] =
        "<br>There are currently " + messagesCount +
        " messages in your inbox, with the following size repartition: ";
    stringOutput[6] =
        "for an estimated total size of " + totalSize + " bytes. ";
    resolve();
  });
  await fillIntroOutro;
  return new Promise(resolve => { resolve(stringOutput); });
}
