// If a fetch error occurs, log it to the console and show it in the UI.
var handleFetchResult = function (result) {
  if (!result.ok) {
    return result
      .json()
      .then(function (json) {
        if (json.error && json.error.message) {
          throw new Error(
            result.url + " " + result.status + " " + json.error.message
          );
        }
      })
      .catch(function (err) {
        showErrorMessage(err);
        throw err;
      });
  }
  return result.json();
};

// Create a Checkout Session with the selected plan ID
var createCheckoutSession = function (priceId) {
  return fetch(
    `${process.env.LAMBDA_URL}/typeform-functions/create-checkout-session`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then(handleFetchResult);
};

// Handle any errors returned from Checkout
var handleResult = function (result) {
  if (result.error) {
    showErrorMessage(result.error.message);
  }
};

var showErrorMessage = function (message) {
  var errorEl = document.getElementById("error-message");
  errorEl.textContent = message;
  errorEl.style.display = "block";
};

/* Get your Stripe publishable key to initialize Stripe.js */
var publishableKey = process.env.STRIPE_PK; //json.publishableKey;
var priceId = process.env.STRIPE_PRODUCT; //json.basicPrice;
//var proPriceId = json.proPrice;

var stripe = Stripe(publishableKey);
// Setup event handler to create a Checkout Session when button is clicked
document
  .getElementById("basic-plan-btn")
  .addEventListener("click", function (evt) {
    createCheckoutSession(priceId).then(function (data) {
      console.log(data);
      // Call Stripe.js method to redirect to the new Checkout page
      stripe
        .redirectToCheckout({
          sessionId: data.sessionId,
        })
        .then(handleResult);
    });
  });

// Setup event handler to create a Checkout Session when button is clicked
/* document
      .getElementById("pro-plan-btn")
      .addEventListener("click", function(evt) {
        createCheckoutSession(proPriceId).then(function(data) {
          // Call Stripe.js method to redirect to the new Checkout page
          stripe
            .redirectToCheckout({
              sessionId: data.sessionId
            })
            .then(handleResult);
        });
      }); */
