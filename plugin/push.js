'use strict';

var API_KEY = 'AIzaSyCrEo83lubM6YQlcVaRdSkrXktmXDMz1To';

var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

var curlCommandArea = document.querySelector('#curlCommand');

function initialize() {
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.log('Notifications aren\'t supported.');
    showUnsupported();
    return;
  }
  if (Notification.permission === 'denied') {
    console.log('The user has blocked notifications.');
    showUnsupported();
    return;
  }
  if (!('PushManager' in window)) {
    console.log('Push messaging isn\'t supported.');
    showUnsupported();
    return;
  }

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {


          if (!subscription) {
            return;
          }

          sendSubscriptionToServer(subscription);

        })
        .catch(function(err) {
          console.log('Error during getSubscription()', err);
        });
  });
  
  curlCommandArea.addEventListener('click', function() {
    selectCurlText();
  });
}


function unsubscribe() {
  curlCommandArea.textContent = '';

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.getSubscription().then(
      function(pushSubscription) {
        if (!pushSubscription) {
          return;
        }

        pushSubscription.unsubscribe().then(function() {
        }).catch(function(e) {
          console.log('Unsubscription error: ', e);
        });
      }).catch(function(e) {
        console.log('Error thrown while unsubscribing from push messaging.', e);
      });
  });
}

function subscribe() {

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
      .then(function(subscription) {

        return sendSubscriptionToServer(subscription);
      })
      .catch(function(e) {
        if (Notification.permission === 'denied') {
          console.log('Permission for Notifications was denied');
        } else {
          console.log('Unable to subscribe to push.', e);
        }
      });
  });
}

function sendSubscriptionToServer(subscription) {
  var mergedEndpoint = endpointWorkaround(subscription);
  showCurlCommand(mergedEndpoint);
}

function showUnsupported() {
  document.querySelector('.supported').style.display = 'none';
  document.querySelector('.unsupported').style.display = 'block';
}

function showCurlCommand(mergedEndpoint) {
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    console.log('This browser isn\'t currently supported for this demo');
    return;
  }

  var endpointSections = mergedEndpoint.split('/');
  var subscriptionId = endpointSections[endpointSections.length - 1];
  var curlCommand = 'curl --header "Authorization: key=' + API_KEY +
      '" --header Content-Type:"application/json" ' + GCM_ENDPOINT +
      ' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';
  
  $.cookie("endpoint",subscriptionId);
  console.log(subscriptionId);
  curlCommandArea.textContent = curlCommand;
  
  selectCurlText();
}

function endpointWorkaround(pushSubscription) {
  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
    return pushSubscription.endpoint;
  }

  var mergedEndpoint = pushSubscription.endpoint;
  if (pushSubscription.subscriptionId &&
      pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
    mergedEndpoint = pushSubscription.endpoint + '/' +
        pushSubscription.subscriptionId;
  }
  return mergedEndpoint;
}

window.addEventListener('load', function() {
      subscribe();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
    .then(initialize);
  } else {
    showUnsupported();
  }
});

function selectCurlText() {
  var range = document.createRange();
  range.selectNodeContents(curlCommandArea);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
}
