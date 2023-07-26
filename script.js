document.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var spots = document.getElementsByClassName('spot');
  var colors = ['#473582', '#694475'];
  var totalRotation = 0;
  var wheelRadius = canvas.width / 2;
  var currentRotation = 0;
  var speed = 10; // Adjust the speed as needed
  var arc = Math.PI / (spots.length / 2);
  var starImage = document.getElementById('star-image');
  var prizePopup = document.getElementById('prize-popup');
  var video = document.getElementById('video-background');
  video.playbackRate = 1.0; // video speed

  var probabilities = [5, 10, 0, 10, 20, 15, 10, 15, 5, 10]; // Customize the probabilities here

  ctx.translate(wheelRadius, wheelRadius);

  var isSpinning = false;
  var winningSpotIndex = -1; // Initialize with an invalid index

 
  var documentContainer = document.getElementById('document-container');
  var logoImage = document.querySelector('.logo-image');

  var digitsInput = document.getElementById('digits-input');
  var submitButton = document.getElementById('submit-button');
  var inputContainer = document.getElementById('input-container');
  digitsInput.setAttribute('autocomplete', 'off');


  function isValidDigits(digits) {
    // Check if the entered digits are valid
    return /^[0-9A-Za-z]{16}$/.test(digits);
  }

  function showInputPopup() {
    console.log('Showing input popup');
    inputContainer.style.display = 'flex';
    inputContainer.classList.add('show');
  }
  
  function hideInputPopup() {
    inputContainer.style.display = 'none';
  }

  digitsInput.addEventListener('input', function() {
    var inputText = this.value.trim(); // Remove leading/trailing white spaces
  
    // Limit the input to 16 characters
    if (inputText.length > 16) {
      inputText = inputText.slice(0, 16);
    }
  
    // Update the input value with the sanitized version
    this.value = inputText;
  
    // Enable/disable the submit button based on the number of characters
    if (inputText.length === 16) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });
  
  // Add a flag to track if the digits have been submitted
var digitsSubmitted = false;

function spinWheel() {
  if (digitsSubmitted) {
    if (!isSpinning) {
      spinWheelAnimation();
    }
  } else {
    var isValid = isValidDigits(digitsInput.value);
    if (isValid) {
      digitsSubmitted = true; 
      setTimeout(function() {
        hideInputPopup();
        inputContainer.classList.remove('show');
    }, 1);
    } else {
      showInputPopup();
    }
  }
}

submitButton.addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default form submission behavior
  if (!digitsSubmitted) {
    spinWheel();
  }
});

  

  function determineWinningSpot() {
    var totalProbability = probabilities.reduce((sum, probability) => sum + probability, 0);
    var randomValue = Math.random() * totalProbability;
    var cumulativeProbability = 0;

    for (var index = 0; index < spots.length; index++) {
      cumulativeProbability += probabilities[index];
      if (randomValue < cumulativeProbability) {
        return index;
      }
    }

    return -1; // No winning spot found
  }

  function showPrizePopup() {
    prizePopup.classList.remove('hidden');
    prizePopup.classList.add('show');
    starImage.style.display = 'block';

    if (winningSpotIndex !== -1) {
      var winningSpot = spots[winningSpotIndex];
      var spotInner = winningSpot.querySelector('.spot-inner');

      spotInner.classList.add('show');

      // Hide other spot text
      Array.from(spots).forEach(function(spot, index) {
        if (index !== winningSpotIndex) {
          spot.querySelector('.spot-inner').classList.remove('show');
        }
      });

      var prizeName = document.getElementById('prize-name');
      prizeName.textContent = spotInner.textContent;
      prizeName.style.visibility = 'visible';
      prizeName.style.zIndex = '20'; /* Update the z-index value */

      // Add event listener to hide prize on touch or click
      prizePopup.addEventListener('touchstart', hidePrize);
      prizePopup.addEventListener('click', hidePrize);
    }
  }

  function reloadPage() {
    location.reload();
  }
  

  function hidePrize() {
    prizePopup.classList.remove('show');
    prizePopup.classList.add('hidden');
    starImage.style.display = 'none';

    // Hide the prize name
    var prizeName = document.getElementById('prize-name');
    prizeName.style.visibility = 'hidden';

    // Hide the spot inner text
    var spotInners = document.querySelectorAll('.spot-inner');
    spotInners.forEach(function(spotInner) {
      spotInner.classList.remove('show');
    });

    // Remove event listener to hide prize
    prizePopup.removeEventListener('touchstart', hidePrize);
    prizePopup.removeEventListener('click', hidePrize);

    // Allow spinning the wheel again
    isSpinning = false;

    // Reload the page
    setTimeout(function() {
      location.reload();
    }, 60);
  }  

  function drawWheel() {
    var startAngle = 0;

    ctx.clearRect(-wheelRadius, -wheelRadius, canvas.width, canvas.height);

    Array.from(spots).forEach(function(spot, index) {
      var angle = startAngle + arc;
      var spotAngle = (startAngle + angle) / 2; // Calculate the angle of the spot

      ctx.beginPath();
      ctx.arc(0, 0, wheelRadius, startAngle, angle, false);
      ctx.lineTo(0, 0);
      ctx.fillStyle = colors[index % 2];
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "#ffffff"; // Replace #your-color with your desired color
      ctx.rotate(spotAngle);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(wheelRadius / 1.7, 0); // Move a bit along the radius

      var lines = wrapText(ctx, spot.textContent, wheelRadius / 1.3, 26);
      var lineheight = 24;

      lines.forEach(function(line, i) {
        ctx.save();
        ctx.translate(0, -lineheight / 2 * (lines.length - 1) + i * lineheight); // Adjust vertical position based on line height
        ctx.fillText(line, 0, 0); // Draw the text
        ctx.restore();
      });

      ctx.restore();

      startAngle += arc;
    });
  }

  function wrapText(context, text, maxWidth, fontSize) {
    var words = text.split(' ');
    var lines = [];
    var line = '';

    context.font = fontSize + 'px Arial';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  }

  function handleTouchStart(event) {
    startY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    event.preventDefault();
    currentY = event.touches[0].clientY;
    var deltaY = currentY - startY;

    if (deltaY > 0) {
      spinWheel();
    }
  }

  function handleMouseDown(event) {
    startY = event.clientY;
  }

  function handleMouseMove(event) {
    event.preventDefault();
    currentY = event.clientY;
  }

  function handleMouseUp(event) {
    var deltaY = currentY - startY;

    if (deltaY > 0) {
      spinWheel();
    }
  }

  function togglePopup() {
    documentContainer.classList.toggle('show');
  }

  function spinWheelAnimation() {
    if (isSpinning) {
      return; // Exit if the wheel is already spinning
    }

    isSpinning = true;
    var spinDegrees = Math.floor(Math.random() * 360);
    totalRotation = 1800 + spinDegrees;

    var spinAnimation = setInterval(function() {
      ctx.clearRect(-wheelRadius, -wheelRadius, canvas.width, canvas.height);
      ctx.save();
      ctx.rotate(currentRotation * Math.PI / 180);
      drawWheel();
      ctx.restore();

      if (currentRotation >= totalRotation) {
        clearInterval(spinAnimation);
        currentRotation %= 360; // Ensure currentRotation stays within 0-359 degrees
        winningSpotIndex = determineWinningSpot();
        showPrizePopup();
        isSpinning = false; // Set isSpinning to false after the spin animation ends
      } else {
        currentRotation += speed;
      }
    }, 1000 / 60); // 60 frames per second
    digitsSubmitted = false; 
  }

  var wheelContainer = document.getElementById('wheel');
  var startY = 0;
  var currentY = 0;

  wheelContainer.addEventListener('touchstart', handleTouchStart, false);
  wheelContainer.addEventListener('touchmove', handleTouchMove, false);
  wheelContainer.addEventListener('mousedown', handleMouseDown, false);
  wheelContainer.addEventListener('mousemove', handleMouseMove, false);
  wheelContainer.addEventListener('mouseup', handleMouseUp, false);

 
  logoImage.addEventListener('click', togglePopup);

  submitButton.addEventListener('click', showInputPopup); // Updated event listener
  document.addEventListener('click', function(event) {
    var documentContainer = document.getElementById('document-container');
    var target = event.target;

    // Check` if the clicked element is outside of the document container
    if (
      !documentContainer.contains(target) &&
      target !== documentContainer &&
      !target.classList.contains('logo-image')
    ) {
      documentContainer.classList.remove('show');
    }
  });

  ctx.font = '16px Arial';
  drawWheel();

  var spinButton = document.getElementById('spin-button');
  spinButton.addEventListener('click', function() {
    showInputPopup();
 });
})
