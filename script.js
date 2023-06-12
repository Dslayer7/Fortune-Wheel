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
  var probabilities = [50, 20, 0, 20, 0, 0, 0, 0, 0, 10]; // Customize the probabilities here

  ctx.translate(wheelRadius, wheelRadius);

  var isSpinning = false;
  var winningSpotIndex = -1; // Initialize with an invalid index

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

  function spinWheel() {
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
  }

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
    }
  }
  
  

  ctx.font = '16px Arial';
  drawWheel();

  var spinButton = document.getElementById('spin-button');
  spinButton.addEventListener('click', spinWheel);
});

const joinButton = document.querySelector('.join-button');
  const popupContainer = document.getElementById('popup-container');

  joinButton.addEventListener('click', () => {
    popupContainer.classList.toggle('show');
  });