/* TODO  CREATE A COOL GUI WITH BUTTONS AND INPUTSS TO CALC NDL AND BUFFER TIME 
#       - ONCE THATS DONE we try to calculate for repeate dives based on presssure groups, surface interval
#       - we would calculate the new NDL based on the previous dive and surface interval.

#       - A nitrogen tank that fills as you input the planned bottom time
        - Add bubbles that rise from the scuba diver every 2ish seconds

#       - SUPER FUTURE implement the actual physics and algs that PADI used to calc the tables
#       - NDL can be affected by water temp, age, weight, gas mixture, exertion, and altitude.

What the UI needs, concretely:
Dive 1: depth + bottom time → shows a pressure group letter (top corner kinda hidden)
A surface interval input (e.g. "how many hours/minutes did you wait")
Dive 2: depth (another slider, or reuse the same one) → shows the adjusted NDL for this second dive, 
clearly different from what a fresh dive to that depth would allow

"After your first dive, if you wait X and go back down to Y feet, 
ou actually only have Z minutes this time — not the usual NDL for that depth." 
Comparison (fresh NDL vs. adjusted NDL) 

*/

// Maps the depth of the dive in feet to the non-decompression limit (NDL) in minutes based on PADI dive tables.
// Ex. ndlMap[70] = 40 means that at a depth of 70 feet, you have 40 minuites before you reach your NDL.
const ndlTable = {
    35: 205,
    40: 140,
    50: 80,
    60: 55,
    70: 40,
    80: 30,
    90: 25,
    100: 20,
    110: 16,
    120: 13,
    130: 10,
    140: 8
}

// Returns the NDL for a given depth in feet. 
// If the depth is not in the table, it will 
// return the NDL for the next available shallower depth.
function getNDL(depth) {
    if (Number.isInteger(depth) && depth >= 35 && depth <= 140) {
        let ndl = ndlTable[depth];
        while (ndl == undefined) {
            depth--;
            ndl = ndlTable[depth];
        }
        return ndl;
    } else {
        console.log("Depth must be an integer between 35 and 140 feet.");
        return null;
    }
}

// NOT CURRENTLY IN USE BC OF USER INPUT, THE NEXT THING TO DO IS MAKE A WINDOW 
// WITH COOL BUTTONS AND INPUT FIELDS FOR DEPTH AND BOTTOM TIME, THEN CALCULATE NDL AND BUFFER TIME
// Calculates the buffer time left based on the depth and bottom time of the dive.
function calculateBufferTime(depth, bottomTime) {
    const ndl = getNDL(depth);
    if ((bottomTime+5) < ndl) {
        return "Your current dive plan looks good! Have a safe and fun dive! You have " + (ndl - bottomTime) + " minutes of buffer time.";
    } else if (bottomTime <= ndl) {
        return "Your current dive plan is safe, but you are close to your NDL limit. You have " + (ndl - bottomTime) + " minutes of buffer time.";
    } else {
        return "Your current dive plan is unsafe. You have exceeded your NDL limit by " + (bottomTime - ndl) + " minutes. Acend to a shallower depth or decrease dive time.";
    }
}

function lerpColor(startColor, endColor, percent) {
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percent);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percent);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function getDepthColor(color, depth) {
  const percent = (depth - 35) / (105);
  let startColor, endColor;

  if (color == "red") {
    startColor = { r: 91, g: 67, b: 131 }; // red
    endColor = { r: 10, g: 7, b: 58 };
  } else if (color == "orange") {
    startColor = { r: 245, g: 195, b: 179 }; // orange
    endColor = { r: 174, g: 115, b: 126 };
  } else if (color == "yellow") {
    startColor = { r: 3, g: 254, b: 240 }; // yellow
    endColor = { r: 3, g: 139, b: 201 };
  } else if (color == "green") {
    startColor = { r: 0, g: 255, b: 249 }; // green
    endColor = { r: 0, g: 186, b: 185 };
  } else if (color == "blue") {
    startColor = { r: 56, g: 94, b: 252 }; // blue
    endColor = { r: 34, g: 23, b: 245 };
  } else if (color == "purple") {
    startColor = { r: 10, g: 8, b: 187 }; // purple
    endColor = { r: 22, g: 3, b: 221 };
  } else if (color == "pink") {
    startColor = { r: 224, g: 91, b: 214 }; //pink
    endColor = { r: 180, g: 34, b: 199 };
  }

  return lerpColor(startColor, endColor, percent);
}

const slider = document.getElementById("depthSlider");
const minInput = document.getElementById("minIN");
const hrInput = document.getElementById("hrIN");
const diver = document.getElementById("diver");
const depthLabel = document.getElementById("depthLabel");
const containerHeight = 400; 
const ndlLabel = document.getElementById("ndlLabel");
const ssLabel = document.getElementById("ssLabel");
const dpLabel = document.getElementById("dpLabel");
const colorLabel = document.getElementById("colorLabel");
const redC = document.getElementById("redBox");
const orangeC = document.getElementById("orangeBox");
const yellowC = document.getElementById("yellowBox");
const greenC = document.getElementById("greenBox");
const blueC = document.getElementById("blueBox");
const purpleC = document.getElementById("purpleBox");
const pinkC = document.getElementById("pinkBox");

function updateAll() {
  const depth = Number(slider.value);
  depthLabel.innerText = "Depth: " + depth + " ft";
  colorLabel.innerText = "Colors At Depth " + depth + "ft:";
  const percent = (depth - slider.min) / (slider.max - slider.min);
  const pixelPosition = percent * containerHeight;
  diver.style.top = pixelPosition + "px";
  const ndl = getNDL(depth);
  ndlLabel.innerText = "NDL: " + ndl + " mins";
  const bottomTime = getTimeInMins(Number(hrInput.value), Number(minInput.value));
  ssLabel.innerText = "" + safetyStopCheck(depth, bottomTime);
  dpLabel.innerText = "" + calculateBufferTime(depth, bottomTime);
  redC.style.backgroundColor = getDepthColor("red", depth);
  orangeC.style.backgroundColor = getDepthColor("orange", depth);
  yellowC.style.backgroundColor = getDepthColor("yellow", depth);
  greenC.style.backgroundColor = getDepthColor("green", depth);
  blueC.style.backgroundColor = getDepthColor("blue", depth);
  purpleC.style.backgroundColor = getDepthColor("purple", depth);
  pinkC.style.backgroundColor = getDepthColor("pink", depth);
}

slider.addEventListener("input", updateAll);
minInput.addEventListener("input", updateAll);
hrInput.addEventListener("input", updateAll);

const singleDiveBtn = document.getElementById("singleDiveBtn");
const multiDiveBtn = document.getElementById("multiDiveBtn");
const singleDive = document.getElementById("singleDive");
const multiDive = document.getElementById("multiDive");

singleDiveBtn.addEventListener("click", function () {
  singleDive.style.display = "block";
  multiDive.style.display = "none";

  singleDiveBtn.classList.add("active");
  multiDiveBtn.classList.remove("active");
});

multiDiveBtn.addEventListener("click", function () {
  multiDive.style.display = "block";
  singleDive.style.display = "none";

  multiDiveBtn.classList.add("active");
  singleDiveBtn.classList.remove("active");
});

function safetyStopCheck(depth, bottomTime) {
    if (depth >= 100) {
        return "Safety Stop Required";
    } else if (depth > 90 && bottomTime >= 22) {
        return "Safety Stop Required";
    } else if (depth > 80 && bottomTime >= 26) {
        return "Safety Stop Required";
    } else if (depth > 70 && bottomTime >= 35) {
        return "Safety Stop Required";
    } else if (depth > 60 && bottomTime >= 49) {
        return "Safety Stop Required";
    } else if (depth > 50 && bottomTime >= 67) {
        return "Safety Stop Required";
    } else if (depth > 40 && bottomTime >= 111) {
        return "Safety Stop Required";
    } else if (depth > 35 && bottomTime >= 152) {
        return "Safety Stop Required";
    } else {
        return "Safety Stop Recommended";
    }
}

function getTimeInMins(hours, minutes) {
    return (hours * 60) + minutes;
}
