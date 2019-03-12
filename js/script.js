var numbersStringArray = new Array(8);
var statsArray = new Array(4);
var totalSize = 0;
var messagesCount = 0;
var conversionCarbonPerByte = 19.0 / 1000000.0;
var conversionMilesPerCarbon = 1.0 / 404.0;
var conversionKmPerCarbon = conversionMilesPerCarbon / 0.621371;

function onSignIn(googleUser) {

  // Useful data for your client-side scripts:
  var profile = googleUser.getBasicProfile();

  var name = profile.getName();
  var givenName = profile.getGivenName();
  document.getElementById("welcome-text").innerHTML = "Welcome \n" + givenName;
  var familyName = profile.getFamilyName();
  var imageUrl = profile.getImageUrl();
  var email = profile.getEmail();

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;

  // Compute email statistics
  computeEmailStatistics(email, getEmailStats);

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
  add_about.innerHTML = '<a href="#about">Stats</a>';
  add_about.setAttribute('id', "about-menu-item");
  document.getElementById("main-menu-list").appendChild(add_about);
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
  document.getElementById("signin-button").style.display = "none";
  document.getElementById("portfolio").style.display = "block";
  document.getElementById("about").style.display = "block";
  document.getElementById("skills").style.display = "block";
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

    document.getElementById("portfolio").style.display = "none";
    document.getElementById("about").style.display = "none";
    document.getElementById("skills").style.display = "none";
    document.getElementById("signout-link").style.display = "none";
    document.getElementById("services").style.display = "block";
    document.getElementById("signin-button").style.display = "block";

    numbersStringArray = new Array(8);
    statsArray = new Array(4);
    totalSize = 0;
    messagesCount = 0;
  });
}

function computeEmailStatistics(email, callback) {
  // Get list of messages
  gapi.client.load('gmail', 'v1', callback);
}

function printOutput(stringArray, id) {
  document.getElementById(id).innerHTML = "";
  for (i = 0; i < stringArray.length; i++) {
    document.getElementById(id).innerHTML += stringArray[i];
  }
}

function getMessages(userId, query, spam, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId' : userId,
          'pageToken' : nextPageToken,
          'includeSpamTrash' : true,
          'q' : query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list(
      {'userId' : userId, 'includeSpamTrash' : true, 'q' : query});
  getPageOfMessages(initialRequest, []);
}

function countMessagesInSizeRange(lowerSize, upperSize, averageSizeInBytes,
                                  index) {
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

  getMessages('me', stringSizeQuery, true, (result) => {
    numbersStringArray[index] =
        '<span style="color: #e54b76;"><strong>' + stringSizeRange +
        '<strong></span> <span style="color:#727190;"><em>' +
        ((result[0] == null) ? 0 : result.length) + '</em></span><br>';
    messagesCount += ((result[0] == null) ? 0 : result.length);
    totalSize += ((result[0] == null) ? 0 : result.length) * averageSizeInBytes;
  });
}

function getEmailStats() {
  // Get number of messages within size brackets to estimate size
  var lowerBounds = [ '', '250K', '500K', '1M', '2M', '5M' ];
  var upperBounds = [ '250K', '500K', '1M', '2M', '5M', '' ];
  var messageAverageSizes = [ 125, 375, 750, 1500, 3500, 10000 ];

  for (let i = 0; i < 6; i++) {
    countMessagesInSizeRange(lowerBounds[i], upperBounds[i],
                             messageAverageSizes[i], i + 1);
  }

  // Compute improvement stats
  getMessages('me', 'in:trash', true, (result) => {
    console.log("Result", result);
    statsArray[0] = (result[0] == null) ? 0 : result.length;
  });
  getMessages(
      'me', 'in:sent', true,
      (result) => { statsArray[1] = (result[0] == null) ? 0 : result.length; });
  getMessages(
      'me', 'in:spam', true,
      (result) => { statsArray[2] = (result[0] == null) ? 0 : result.length; });
  getMessages(
      'me', 'older_than:1y', true,
      (result) => { statsArray[3] = (result[0] == null) ? 0 : result.length; });
}

function computeCarbonFootprint(callback) {
  // Use the carbon per Mb conversion to compute the total carbon footprint of
  // the inbox
  var totalFootprint = totalSize * conversionCarbonPerByte;
  var totalMiles = totalFootprint * conversionMilesPerCarbon;
  var totalKm = totalFootprint * conversionKmPerCarbon;

  var stringArray = [
    'This is equivalent to <br><span style="color: #e54b76;"><strong>' +
    totalFootprint.toExponential(2) +
    'g</strong></span> of CO². Or <span style="color: #e54b76;"><strong>' +
    totalKm.toExponential(2) + 'km </strong></span>(or ' +
    totalMiles.toExponential(2) +
    ' miles) driven on an average car with a 11L/100km = 22mpg consumption.'
  ]

  callback(stringArray, "email-stats2");
}

function showNumbers() {
  document.getElementById("show-email-numbers").style.display = "none";

  numbersStringArray[0] =
      "<br>There are currently " + messagesCount +
      " messages in your inbox, with the following size repartition:<br>";
  numbersStringArray[7] =
      'for an estimated total size of <span style="color: #e54b76;"><strong>' +
      totalSize + '</strong></span> bytes. ';

  printOutput(numbersStringArray, "email-stats");

  document.getElementById("email-stats").style.display = "block";
  document.getElementById("email-image1").style.display = "block";

  computeCarbonFootprint(printOutput);

  document.getElementById("email-stats2").style.display = "block";
  document.getElementById("email-image2").style.display = "block";

  document.getElementById('about').scrollIntoView(
      {block : 'start', behavior : 'smooth'});
}

function sum(array) {
  var sumValue = 0;
  for (i = 0; i < array.length; i++) {
    sumValue += array[i];
  }
  return sumValue;
}

function showStats() {
  document.getElementById("show-email-stats").style.display = "none";

  console.log("statsArray", statsArray);

  var messagesToClean = sum(statsArray);

  console.log("sum", messagesToClean);

  if (statsArray[0] > 0.15 * messagesToClean) {
    var messagesPercentage = 100 * statsArray[0] / messagesToClean;
    document.getElementById("trash-percentage").style.width =
        messagesPercentage.toFixed() + "%";
    document.getElementById("trash-percentage-disp").innerHTML =
        messagesPercentage.toFixed() + "%";
    document.getElementById("trash-bar").style.display = "block";
  }
  if (statsArray[1] > 0.15 * messagesToClean) {
    var messagesPercentage = 100 * statsArray[1] / messagesToClean;
    document.getElementById("sent-percentage").style.width =
        messagesPercentage.toFixed() + "%";
    document.getElementById("sent-percentage-disp").innerHTML =
        messagesPercentage.toFixed() + "%";
    document.getElementById("sent-bar").style.display = "block";
  }
  if (statsArray[2] > 0.15 * messagesToClean) {
    var messagesPercentage = 100 * statsArray[2] / messagesToClean;
    document.getElementById("spam-percentage").style.width =
        messagesPercentage.toFixed() + "%";
    document.getElementById("spam-percentage-disp").innerHTML =
        messagesPercentage.toFixed() + "%";
    document.getElementById("spam-bar").style.display = "block";
  }
  if (statsArray[3] > 0.15 * messagesToClean) {
    var messagesPercentage = 100 * statsArray[3] / messagesToClean;
    document.getElementById("old-percentage").style.width =
        messagesPercentage.toFixed() + "%";
    document.getElementById("old-percentage-disp").innerHTML =
        messagesPercentage.toFixed() + "%";
    document.getElementById("old-bar").style.display = "block";
  }
}
