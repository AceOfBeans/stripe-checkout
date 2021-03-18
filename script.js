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
    `https://1vvgf51qqj.execute-api.us-east-1.amazonaws.com/Prod/typeform-functions/create-checkout-session`,
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

fetch("/setup")
  .then(handleFetchResult)
  .then(function (json) {
    var publishableKey = json.publishableKey;
    var priceId = json.basicPrice;

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
  });
