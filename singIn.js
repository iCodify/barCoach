/**
 * Function called when clicking the Login/Logout button.
 */
// [START buttoncallback]
function toggleSignInGoogle() {
    if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.GoogleAuthProvider();
        //var provider = new firebase.auth.FacebookAuthProvider();
        // [END createprovider]
        // [START addscopes]
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithRedirect(provider);
        // [END signin]
    } else {
        // [START signout]
        firebase.auth().signOut();
        window.location.reload(false); 
        // [END signout]
    }
    // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in-google').disabled = true;
    document.getElementById('quickstart-sign-in-facebook').disabled = true;
    // [END_EXCLUDE]
}
    // [END buttoncallback]
function toggleSignInFacebook() {
    if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.FacebookAuthProvider();
        // [END createprovider]
        // [START signin]
        firebase.auth().signInWithRedirect(provider);
        // [END signin]
    } else {
        // [START signout]
        firebase.auth().signOut();
        window.location.reload(false); 
        // [END signout]
    }
    // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in-google').disabled = true;
    document.getElementById('quickstart-sign-in-facebook').disabled = true;
    // [END_EXCLUDE]
}

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
function initApp() {
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
            var credential = result.credential;
            var user = result.user;
            var token = result.credential.accessToken;
        // [START_EXCLUDE]
        } else {
        // [END_EXCLUDE]
        }
        // The signed-in user info.
        var user = result.user;
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
        } else {
        console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END getidptoken]

    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        if(user.providerData["0"].providerId === "google.com") {
            document.getElementById('quickstart-sign-in-google').textContent = 'Sign out';
            document.getElementById('quickstart-sign-in-facebook').hidden = true;
        }
        else if(user.providerData["0"].providerId === "facebook.com") {
            document.getElementById('quickstart-sign-in-facebook').textContent = 'Sign out';
            document.getElementById('quickstart-sign-in-google').hidden = true;
        }
        // [START_EXCLUDE]
        
        startApp(uid, email, displayName);
        
        // [END_EXCLUDE]
        } else {
        // User is signed out.
        // [START_EXCLUDE]
        document.getElementById('quickstart-sign-in-google').hidden = false;
        document.getElementById('quickstart-sign-in-facebook').hidden = false;
        
        document.getElementById('quickstart-sign-in-google').textContent = 'Sign in';
        document.getElementById('quickstart-sign-in-facebook').textContent = 'Sign in';
        // [END_EXCLUDE]
        }
        // [START_EXCLUDE]
        document.getElementById('quickstart-sign-in-google').disabled = false;
        document.getElementById('quickstart-sign-in-facebook').disabled = false;
        // [END_EXCLUDE]
    });
    // [END authstatelistener]

    document.getElementById('quickstart-sign-in-google').addEventListener('click', toggleSignInGoogle, false);
    document.getElementById('quickstart-sign-in-facebook').addEventListener('click', toggleSignInFacebook, false);
}

    window.onload = function() {
    initApp();
    };