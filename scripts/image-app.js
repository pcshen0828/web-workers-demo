(function () {
  // http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
  var original;
  var imageLoader = document.querySelector("#imageLoader");
  imageLoader.addEventListener("change", handleImage, false);
  var canvas = document.querySelector("#image");
  var ctx = canvas.getContext("2d");

  var imageWorker = new Worker("scripts/worker.js");

  function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  // greys out the buttons while manipulation is happening
  // un-greys out the buttons when the manipulation is done
  function toggleButtonsAbledness() {
    var buttons = document.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute("disabled")) {
        buttons[i].removeAttribute("disabled");
      } else {
        buttons[i].setAttribute("disabled", null);
      }
    }
  }

  function manipulateImage(type) {
    var a, b, g, i, imageData, j, length, pixel, r, ref;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    toggleButtonsAbledness();

    // Hint! This is where you should post messages to the web worker and
    // receive messages from the web worker.

    imageWorker.postMessage({ imageData, type });

    imageWorker.onmessage = function (e) {
      toggleButtonsAbledness();
      var image = e.data;
      if (image) return ctx.putImageData(image, 0, 0);
      console.log("No manipulated image returned.");
    };

    imageWorker.onerror = function (error) {
      class WorkerException {
        constructor(message) {
          this.name = "WorkerException";
          this.message = message;
          throw new WorkerException("Worker error.");
        }
      }
    };
  }

  function revertImage() {
    return ctx.putImageData(original, 0, 0);
  }

  document.querySelector("#invert").onclick = function () {
    manipulateImage("invert");
  };
  document.querySelector("#chroma").onclick = function () {
    manipulateImage("chroma");
  };
  document.querySelector("#greyscale").onclick = function () {
    manipulateImage("greyscale");
  };
  document.querySelector("#vibrant").onclick = function () {
    manipulateImage("vibrant");
  };
  document.querySelector("#revert").onclick = function () {
    revertImage();
  };
})();
