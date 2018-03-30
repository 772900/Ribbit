// RiBBiT! Chirper Project v1.5
// Authors: Bill, Joshua, Keenan

// Master Public Function
var masterRibbit = (function () {

    var croakObj = [];  // Array for all croaks (messages)
    var knotObj = [];  // Array for all knots (friends)
    var profileObj = [];  // Array for all profiles

    var baseUrl = [];  // Array for all URLs in Firebase that will be accessed

    var croakToUpdate;  // Contains the croaks to update
    var knotToUpdate;  // Contains the knot to update
    var profileToUpdate;  // Contains the profile to update
    var myBaseUrl = "rbbt1";

    // Generates final url for Firebase calls.
    function urlMaker(baseUrl, folder) {
        var url = "https://" + baseUrl + ".firebaseio.com/" + folder + "/"
        for (var i = 2; i < arguments.length; i++) {
            url += arguments[i] + "/";
        }
        url += ".json";
        console.log("final url:", url);
        return url;
    }

    // handle all XHR calls
    // @ verb - Http method 
    // @ url - firebase app url (Fetch & Post to)
    // @ data - the object to send to FB
    // @ callback_success - method to call on Success
    // @ callback_error - method to call on Error
    // @ extra - future need
    function masterXhr(verb, url, data, callback_success, callback_error, extra) {
        console.log(verb, url, data);
        var request = new XMLHttpRequest();
        request.open(verb, url, true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                if (callback_success && typeof (callback_success) == "function") {
                    callback_success(JSON.parse(this.response));
                }
            } else {
                if (callback_error && typeof (callback_error) == "function") {
                    callback_error("MASTER XHR ERROR: " + this.response);
                }
            }
        };
        if (data) {  // check on VERB type (GET or POST)
            request.send(JSON.stringify(data))
        } else {
            request.send();
        }
    };

    /* Object Constructors -------------------------------------------------------------------------------- */
    // Croak Constructor
    function Croak(displayname, croakmsg, timestamp, guid) {
        this.displayname = displayname,
        this.croakmsg = croakmsg,
        this.timestamp = timestamp,
        this.id = guid
    };

    // Knot Constructor
    function Knot(avatarurl, displayname, fburl, guid) {
        this.avatarurl = avatarurl,
        this.displayname = displayname,
        this.fburl = fburl,
        this.id = guid
    };

    // Profile Constructor
    function Profile(fname, lname, email, username, guid) {
        this.fname = fname,
        this.lname = lname,
        this.email = email,
        this.username = username,
        this.id = guid
    };

    // calback - generic error message
    function myErr() {
        console.log("Callback Error");
    }

    /* PROFILE SECTION ------------------------------------------------------------------------------ */
    /* GET PROFILE ---------------------------------------------------------------------------------- */
    // Gets the current user's profile from Firebase
    function getProfile() {
        masterXhr('GET', urlMaker(myBaseUrl, "profile"), null, showProfile, myErr);
    };

    // Run the getProfile function on page load
    getProfile();

    // Adds the Profile to the profile object array
    function showProfile(tData) {
        profileObj = [];           // clear the profile
        //        var counter = 0;
        var profObj; // profile object from the Profile constructor
        for (var i in tData) {
            var profile = tData[i];
            // creating a new Profile object
            profObj = new Profile(profile.fname, profile.lname, profile.email, profile.username, i);
            // add it (newly created Contacts object) to the array
            profileObj.push(profObj);
            // render to screen
            renderProfile();
        }
    }

    // Renders the Profile on the screen
    function renderProfile() {

        var tStr = "";              // temp string used for concat
        var tRes = $("#profileDisplay");   // element to render content
        tRes.empty();               // clear the html
        var counter = 0;
        var profObj;                // profile object from the constructor
        for (var i in profileObj) {
            var profile = profileObj[i];

            // Action buttons
            var editBtn = '<button onclick="masterRibbit.doProfileEdit(' + counter + ')" type="button" class="btn btn-warning"> <span class="glyphicon glyphicon-pencil" aria-hidden="true"> Update</span></button>'
            var avatar = '<img src="http://img3.wikia.nocookie.net/__cb20130807013027/ssb/images/8/8b/Link4.png" alt="Avatar Placeholder" class="img-circle" height="200" width="200" />';

            // render to screen
            tStr = "";              // clear the temp string
            tStr += "<tr>";
            tStr += "<td rowspan='3'>" + avatar + "</td>";
            tStr += "<td colspan='2'>" + profile.fname + " " + profile.lname + "</td>";  // TODO: Style this to be big
            tStr += "</tr>"
            tStr += "<tr>";
            tStr += "<td><span class=''>email: </span>" + profile.email + "</td>";
            tStr += "<td><span class=''>you have x friends</span></td>";  // TODO: Get a count of total friends and post here...
            tStr += "</tr>"
            tStr += "<tr>";3
            tStr += "<td><span class=''>username: </span>" + profile.username + "</td>";
            tStr += "<td>" + editBtn + "</td>"
            tStr += "</tr>"
            counter++;
            tRes.append(tStr);
        }
    };

    /* UPDATE PROFILE --------------------------------------------------------------------------- */
    // populate & show the modal
    function showEditDialog(tempId) {
        // save the ID to local variable
        profileToUpdate = tempId;

        // create temp object of Profile in array (based on index argument)
        var tProfile = profileObj[tempId];
        //populate the fields
        $('#editFname').val(tProfile.fname);
        $('#editLname').val(tProfile.lname);
        $('#editEmail').val(tProfile.email);
        $('#myEditModal').modal("show");
        //
    };

    // save the contents of the modal
    function updateProfile() {
        var name = $('#editFname').val();
        var last = $('#editLname').val();
        var email = $('#editEmail').val();
        var username = myBaseUrl;
        // create obj from vars
        var profToPost = {
            "fname": name,
            "lname": last,
            "email": email,
            "username": username
        }
        // get the guid
        var profGuid = profileObj[profileToUpdate].id
        // ajax call to save
        masterXhr('PATCH', urlMaker(myBaseUrl, "profile", profGuid), profToPost, function () {
            //
            profileObj[profileToUpdate] = profToPost;
            renderProfile(); // refresh the view
            //
        }, myErr);

    };

    /* KNOT SECTION ------------------------------------------------------------------------------ */
    /* GET KNOTS ---------------------------------------------------------------------------------- */
    // Gets the current user's knots (friends) from Firebase
    function getKnot() {
        masterXhr('GET', urlMaker(myBaseUrl, "knot"), null, showKnots, myErr);
    };

    // Run the getProfile function on page load
    getKnot();

    // Adds the Profile to the profile object array
    function showKnots(tData) {
        knotObj = [];           // clear the knots
        var counter = 0;
        var kObj; // knot object from the Knot constructor
        for (var i in tData) {
            var knots = tData[i];
            // creating a new Profile object
            kObj = new Knot(knots.avatarurl, knots.displayname, knots.fburl, i);
            // add it (newly created Contacts object) to the array
            knotObj.push(kObj);
            // render to screen
            renderKnots();
        }
    }

    // Renders the Knots (friends) on the screen
    function renderKnots() {

        var tStr = "";              // temp string used for concat
        var tRes = $("#knotDisplay");   // element to render knots
        tRes.empty();               // clear the html
        var headerString = '<tr><td>&nbsp;</td><td>Name</td><td>URL</td><td>Action</td></tr>';
        tRes.append(headerString);
        var counter = 0;
        var kObj;                // knot object from the constructor
        for (var i in knotObj) {
            var myKnots = knotObj[i];

            // Action buttons
            var deleteBtn = '<button onclick="masterRibbit.doKnotDelete(' + counter + ')" type="button" class="btn btn-danger"> <span class="glyphicon glyphicon-ban-circle" aria-hidden="true"> Delete</span></button>'
            var knotAvatar = '<img src="' + myKnots.avatarurl + '" alt="Knot Avatar" height="100" width="100" class="img-circle" />'

            // render to screen
            tStr = "";              // clear the temp string
            tStr += "<tr>";
            tStr += "<td>" + knotAvatar + "</td>";
            tStr += "<td>" + myKnots.displayname + "</td>";  // TODO: Style this to be big
            tStr += "<td>" + myKnots.fburl + "</td>";  // TODO: Style this to be big
            tStr += "<td>" + deleteBtn + "</td>";
            tStr += "</tr>"
            counter++;
            tRes.append(tStr);
        }
    };

    /* UPDATE PROFILE --------------------------------------------------------------------------- */
    // populate & show the modal
    function showEditDialog(tempId) {
        // save the ID to local variable
        profileToUpdate = tempId;

        // create temp object of Profile in array (based on index argument)
        var tProfile = profileObj[tempId];
        //populate the fields
        $('#editFname').val(tProfile.fname);
        $('#editLname').val(tProfile.lname);
        $('#editEmail').val(tProfile.email);
        $('#myEditModal').modal("show");
        //
    };

    // save the contents of the modal
    function updateProfile() {
        var name = $('#editFname').val();
        var last = $('#editLname').val();
        var email = $('#editEmail').val();
        var username = myBaseUrl;
        // create obj from vars
        var profToPost = {
            "fname": name,
            "lname": last,
            "email": email,
            "username": username
        }
        // get the guid
        var profGuid = profileObj[profileToUpdate].id
        // ajax call to save
        masterXhr('PATCH', urlMaker(myBaseUrl, "profile", profGuid), profToPost, function () {
            //
            profileObj[profileToUpdate] = profToPost;
            renderProfile(); // refresh the view
            //
        }, myErr);

    };

    /* CROAK SECTION ------------------------------------------------------------------------------------------------- */
    /* GET --------------------------------------------------------------------------- */
    // PRIVATE - Get croaks from Firebase
    function getFirebaseCroaks() {
        masterXhr('GET', urlMaker("RBBTC", "croaks"), null, showCroakContent, myErr);
    };

    // render FB content to screen
    function showCroakContent(tData) {
        croakObj = [];           // clear the object
        //        var counter = 0;
        var cObj; // contact object from the constructor
        for (var i in tData) {
            var croak = tData[i];
            // creating a new Contact object
            cObj = new Croak(croak.displayname, croak.croakmsg, croak.timestamp, i);
            // add it (newly created Contacts object) to the array
            croakObj.push(cObj);
            // render to screen
            renderCroaksToScreen();
        }
    }
    // only render the Contacts array
    function renderCroaksToScreen() {

        var tStr = "";              // temp string used for concat
        var tRes = $("#croakDisplay");   // element to render content
        tRes.empty();               // clear the html
        var headerString = '<tr><td>Message</td><td>Timestamp</td><td>DisplayName</td><td>Actions</td></tr>';
        tRes.append(headerString);
        var counter = 0;
        var cObj;                // contact object from the constructor
        for (var i in croakObj) {
            var croak = croakObj[i];

            // Action buttons
            var editBtn = '<button  onclick="myCroaks.doCroakEdit(' + counter + ')" type="button" class="btn btn-warning btn-xs"> <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>'
            var deleteBtn = '<button onclick="myCroaks.doCroakDelete(' + counter + ')" type="button" class="btn btn-danger btn-xs"> <span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'

            // render to screen
            tStr = "";              // clear the temp string
            tStr += "<tr>";
            tStr += "<td>" + croak.croakmsg + "</td>";
            tStr += "<td>" + croak.timestamp + "</td>";
            tStr += "<td>" + croak.displayname + "</td>";
            tStr += "<td>" + editBtn + " " + deleteBtn + "</td>"
            tStr += "</tr>"
            counter++;
            tRes.append(tStr);
        }
    };

    /* ADD CROAK ----------------------------------------------------------------------------------------------------- */
    // Adds a croak to FireBase via AJAX
    function addCroakBuilder() {
        addCroak(myCroakSuccess, myErr)
    }
    function addCroak(successCallback, errorCallback) {
        var croakmsg = $("#croakmsg").val();
        var timestamp = new Date(); //modify
        var displayname = myBaseUrl;

        console.log(croakmsg, timestamp, displayname);
        var croakToPost = {
            "croakmsg": croakmsg,
            "timestamp": timestamp,
            "displayname": displayname
        };
        masterXhr("POST", urlMaker("RBBTC", "croaks"), croakToPost, function (msg) {
            croakToPost.id = msg.name;
            croakObj.push(croakToPost);
            console.log(msg.name, croakToPost);
            //            renderCroaksToScreen(); //modify
        }, myErr);
    };

    // Callback to get latest croaks from Firebase
    function myCroakSuccess() {
        console.log("hit my Success callback");
        //        getFirebaseContacts();
    }

    getFirebaseCroaks();
    

    function init() {

        getFirebaseCroaks();
        myTimer = setInterval(getFirebaseCroaks, 2000);
    }

    init();


    // Expose our private functions here
    return {
        //        addCroak: addNewCroak
        addNewCroak: addCroakBuilder,
        doProfileEdit: showEditDialog,
        doProfileSave: updateProfile



    };

})();