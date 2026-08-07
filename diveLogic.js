/* TODO  CREATE A COOL GUI WITH BUTTONS AND INPUTSS TO CALC NDL AND BUFFER TIME 
#       - ONCE THATS DONE we try to calculate for repeate dives based on presssure groups, surface interval
#       - we would calculate the new NDL based on the previous dive and surface interval.

#       - A nitrogen tank that fills as you input the planned bottom time
        - Add bubbles that rise from the scuba diver every 2ish seconds
        - Little Question mark icon to give info about color depth, NDL and safety stop

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
    startColor = { r: 139, g: 75, b: 140 }; // red
    endColor = { r: 10, g: 7, b: 58 };
  } else if (color == "orange") {
    startColor = { r: 245, g: 195, b: 179 }; // orange
    endColor = { r: 174, g: 115, b: 126 };
  } else if (color == "yellow") {
    startColor = { r: 193, g: 255, b: 230 }; // yellow
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

// This function takes the current pressure group and outputs the new pressure group based on the surface interval.
// Values straight from the PADI dive table. 
// INPUTS: pg = current pressure group (A-Z), surfaceInterval = time in mins
// OUTPUT: new pressure group (A-Z) OR "0" if the diver is fully off-gassed
function pgTransformer(pg, surfaceInterval) {
    if (pg == "A") {
        if (surfaceInterval > 3) {
            return "0";
        } else {
            return "A";
        }
    } else if (pg == "B") {
        if (surfaceInterval > 228) {
            return "0";
        } else if (surfaceInterval > 47) {
            return "A";
        } else {
            return "B";
        }
    } else if (pg == "C") {
        if (surfaceInterval > 250) {
            return "0";
        } else if (surfaceInterval > 69) {
            return "A";
        } else if (surfaceInterval > 21) {
            return "B";
        } else {
            return "C";
        }
    } else if (pg == "D") {
        if (surfaceInterval > 259) {
            return "0";
        } else if (surfaceInterval > 78) {
            return "A";
        } else if (surfaceInterval > 30) {
            return "B";
        } else if (surfaceInterval > 8) {
            return "C";
        } else {
            return "D";
        }
    } else if (pg == "E") {
        if (surfaceInterval > 268) {
            return "0";
        } else if (surfaceInterval > 87) {
            return "A";
        } else if (surfaceInterval > 38) {
            return "B";
        } else if (surfaceInterval > 16) {
            return "C";
        } else if (surfaceInterval > 7) {
            return "D";
        } else {
            return "E";
        }
    } else if (pg == "F") {
        if (surfaceInterval > 275) {
            return "0";
        } else if (surfaceInterval > 94) {
            return "A";
        } else if (surfaceInterval > 46) {
            return "B";
        } else if (surfaceInterval > 24) {
            return "C";
        } else if (surfaceInterval > 15) {
            return "D";
        } else if (surfaceInterval > 7) {
            return "E";
        } else {
            return "F";
        }
    } else if (pg == "G") {
        if (surfaceInterval > 282) {
            return "0";
        } else if (surfaceInterval > 101) {
            return "A";
        } else if (surfaceInterval > 53) {
            return "B";
        } else if (surfaceInterval > 31) {
            return "C";
        } else if (surfaceInterval > 22) {
            return "D";
        } else if (surfaceInterval > 13) {
            return "E";
        } else if (surfaceInterval > 6) {
            return "F";
        } else {
            return "G";
        }
    } else if (pg == "H") {
        if (surfaceInterval > 288) {
            return "0";
        } else if (surfaceInterval > 107) {
            return "A";
        } else if (surfaceInterval > 59) {
            return "B";
        } else if (surfaceInterval > 37) {
            return "C";
        } else if (surfaceInterval > 28) {
            return "D";
        } else if (surfaceInterval > 20) {
            return "E";
        } else if (surfaceInterval > 12) {
            return "F";
        } else if (surfaceInterval > 5) {
            return "G";
        } else {
            return "H";
        }
    } else if (pg == "I") {
        if (surfaceInterval > 294) {
            return "0";
        } else if (surfaceInterval > 113) {
            return "A";
        } else if (surfaceInterval > 65) {
            return "B";
        } else if (surfaceInterval > 43) {
            return "C";
        } else if (surfaceInterval > 34) {
            return "D";
        } else if (surfaceInterval > 26) {
            return "E";
        } else if (surfaceInterval > 18) {
            return "F";
        } else if (surfaceInterval > 11) {
            return "G";
        } else if (surfaceInterval > 5) {
            return "H";
        } else {
            return "I";
        }
    } else if (pg == "J") {
        if (surfaceInterval > 300) {
            return "0";
        } else if (surfaceInterval > 119) {
            return "A";
        } else if (surfaceInterval > 71) {
            return "B";
        } else if (surfaceInterval > 49) {
            return "C";
        } else if (surfaceInterval > 40) {
            return "D";
        } else if (surfaceInterval > 31) {
            return "E";
        } else if (surfaceInterval > 24) {
            return "F";
        } else if (surfaceInterval > 17) {
            return "G";
        } else if (surfaceInterval > 11) {
            return "H";
        } else if (surfaceInterval > 5) {
            return "I";
        } else {
            return "J";
        }
    } else if (pg == "K") {
        if (surfaceInterval > 305) {
            return "0";
        } else if (surfaceInterval > 124) {
            return "A";
        } else if (surfaceInterval > 76) {
            return "B";
        } else if (surfaceInterval > 54) {
            return "C";
        } else if (surfaceInterval > 45) {
            return "D";
        } else if (surfaceInterval > 37) {
            return "E";
        } else if (surfaceInterval > 29) {
            return "F";
        } else if (surfaceInterval > 22) {
            return "G";
        } else if (surfaceInterval > 16) {
            return "H";
        } else if (surfaceInterval > 10) {
            return "I";
        } else if (surfaceInterval > 4) {
            return "J";
        } else {
            return "K";
        }
    } else if (pg == "L") {
        if (surfaceInterval > 310) {
            return "0";
        } else if (surfaceInterval > 129) {
            return "A";
        } else if (surfaceInterval > 81) {
            return "B";
        } else if (surfaceInterval > 59) {
            return "C";
        } else if (surfaceInterval > 50) {
            return "D";
        } else if (surfaceInterval > 42) {
            return "E";
        } else if (surfaceInterval > 34) {
            return "F";
        } else if (surfaceInterval > 27) {
            return "G";
        } else if (surfaceInterval > 21) {
            return "H";
        } else if (surfaceInterval > 15) {
            return "I";
        } else if (surfaceInterval > 9) {
            return "J";
        } else if (surfaceInterval > 4) {
            return "K";
        } else {
            return "L";
        }
    } else if (pg == "M") {
        if (surfaceInterval > 315) {
            return "0";
        } else if (surfaceInterval > 134) {
            return "A";
        } else if (surfaceInterval > 85) {
            return "B";
        } else if (surfaceInterval > 64) {
            return "C";
        } else if (surfaceInterval > 55) {
            return "D";
        } else if (surfaceInterval > 46) {
            return "E";
        } else if (surfaceInterval > 39) {
            return "F";
        } else if (surfaceInterval > 32) {
            return "G";
        } else if (surfaceInterval > 25) {
            return "H";
        } else if (surfaceInterval > 19) {
            return "I";
        } else if (surfaceInterval > 14) {
            return "J";
        } else if (surfaceInterval > 9) {
            return "K";
        } else if (surfaceInterval > 4) {
            return "L";
        } else {
            return "M";
        }
    } else if (pg == "N") {
        if (surfaceInterval > 319) {
            return "0";
        } else if (surfaceInterval > 138) {
            return "A";
        } else if (surfaceInterval > 90) {
            return "B";
        } else if (surfaceInterval > 68) {
            return "C";
        } else if (surfaceInterval > 59) {
            return "D";
        } else if (surfaceInterval > 51) {
            return "E";
        } else if (surfaceInterval > 43) {
            return "F";
        } else if (surfaceInterval > 36) {
            return "G";
        } else if (surfaceInterval > 30) {
            return "H";
        } else if (surfaceInterval > 24) {
            return "I";
        } else if (surfaceInterval > 18) {
            return "J";
        } else if (surfaceInterval > 13) {
            return "K";
        } else if (surfaceInterval > 8) {
            return "L";
        } else if (surfaceInterval > 3) {
            return "M";
        } else {
            return "N";
        }
    } else if (pg == "O") {
        if (surfaceInterval > 324) {
            return "0";
        } else if (surfaceInterval > 143) {
            return "A";
        } else if (surfaceInterval > 94) {
            return "B";
        } else if (surfaceInterval > 72) {
            return "C";
        } else if (surfaceInterval > 63) {
            return "D";
        } else if (surfaceInterval > 55) {
            return "E";
        } else if (surfaceInterval > 47) {
            return "F";
        } else if (surfaceInterval > 41) {
            return "G";
        } else if (surfaceInterval > 34) {
            return "H";
        } else if (surfaceInterval > 28) {
            return "I";
        } else if (surfaceInterval > 23) {
            return "J";
        } else if (surfaceInterval > 17) {
            return "K";
        } else if (surfaceInterval > 12) {
            return "L";
        } else if (surfaceInterval > 8) {
            return "M";
        } else if (surfaceInterval > 3) {
            return "N";
        } else {
            return "O";
        }
    } else if (pg == "P") {
        if (surfaceInterval > 328) {
            return "0";
        } else if (surfaceInterval > 147) {
            return "A";
        } else if (surfaceInterval > 98) {
            return "B";
        } else if (surfaceInterval > 76) {
            return "C";
        } else if (surfaceInterval > 67) {
            return "D";
        } else if (surfaceInterval > 59) {
            return "E";
        } else if (surfaceInterval > 51) {
            return "F";
        } else if (surfaceInterval > 45) {
            return "G";
        } else if (surfaceInterval > 38) {
            return "H";
        } else if (surfaceInterval > 32) {
            return "I";
        } else if (surfaceInterval > 27) {
            return "J";
        } else if (surfaceInterval > 21) {
            return "K";
        } else if (surfaceInterval > 16) {
            return "L";
        } else if (surfaceInterval > 12) {
            return "M";
        } else if (surfaceInterval > 7) {
            return "N";
        } else if (surfaceInterval > 3) {
            return "O";
        } else {
            return "P";
        }
    } else if (pg == "Q") {
        if (surfaceInterval > 331) {
            return "0";
        } else if (surfaceInterval > 150) {
            return "A";
        } else if (surfaceInterval > 102) {
            return "B";
        } else if (surfaceInterval > 80) {
            return "C";
        } else if (surfaceInterval > 71) {
            return "D";
        } else if (surfaceInterval > 63) {
            return "E";
        } else if (surfaceInterval > 55) {
            return "F";
        } else if (surfaceInterval > 48) {
            return "G";
        } else if (surfaceInterval > 42) {
            return "H";
        } else if (surfaceInterval > 36) {
            return "I";
        } else if (surfaceInterval > 30) {
            return "J";
        } else if (surfaceInterval > 25) {
            return "K";
        } else if (surfaceInterval > 20) {
            return "L";
        } else if (surfaceInterval > 16) {
            return "M";
        } else if (surfaceInterval > 11) {
            return "N";
        } else if (surfaceInterval > 7) {
            return "O";
        } else if (surfaceInterval > 3) {
            return "P";
        } else {
            return "Q";
        }
    } else if (pg == "R") {
        if (surfaceInterval > 335) {
            return "0";
        } else if (surfaceInterval > 154) {
            return "A";
        } else if (surfaceInterval > 106) {
            return "B";
        } else if (surfaceInterval > 84) {
            return "C";
        } else if (surfaceInterval > 75) {
            return "D";
        } else if (surfaceInterval > 67) {
            return "E";
        } else if (surfaceInterval > 59) {
            return "F";
        } else if (surfaceInterval > 52) {
            return "G";
        } else if (surfaceInterval > 46) {
            return "H";
        } else if (surfaceInterval > 40) {
            return "I";
        } else if (surfaceInterval > 34) {
            return "J";
        } else if (surfaceInterval > 29) {
            return "K";
        } else if (surfaceInterval > 24) {
            return "L";
        } else if (surfaceInterval > 19) {
            return "M";
        } else if (surfaceInterval > 15) {
            return "N";
        } else if (surfaceInterval > 11) {
            return "O";
        } else if (surfaceInterval > 7) {
            return "P";
        } else if (surfaceInterval > 3) {
            return "Q";
        } else {
            return "R";
        }
    } else if (pg == "S") {
        if (surfaceInterval > 339) {
            return "0";
        } else if (surfaceInterval > 158) {
            return "A";
        } else if (surfaceInterval > 109) {
            return "B";
        } else if (surfaceInterval > 87) {
            return "C";
        } else if (surfaceInterval > 78) {
            return "D";
        } else if (surfaceInterval > 70) {
            return "E";
        } else if (surfaceInterval > 63) {
            return "F";
        } else if (surfaceInterval > 56) {
            return "G";
        } else if (surfaceInterval > 49) {
            return "H";
        } else if (surfaceInterval > 43) {
            return "I";
        } else if (surfaceInterval > 38) {
            return "J";
        } else if (surfaceInterval > 32) {
            return "K";
        } else if (surfaceInterval > 27) {
            return "L";
        } else if (surfaceInterval > 23) {
            return "M";
        } else if (surfaceInterval > 18) {
            return "N";
        } else if (surfaceInterval > 14) {
            return "O";
        } else if (surfaceInterval > 10) {
            return "P";
        } else if (surfaceInterval > 6) {
            return "Q";
        } else if (surfaceInterval > 3) {
            return "R";
        } else {
            return "S";
        }
    } else if (pg == "T") {
        if (surfaceInterval > 342) {
            return "0";
        } else if (surfaceInterval > 161) {
            return "A";
        } else if (surfaceInterval > 113) {
            return "B";
        } else if (surfaceInterval > 91) {
            return "C";
        } else if (surfaceInterval > 82) {
            return "D";
        } else if (surfaceInterval > 73) {
            return "E";
        } else if (surfaceInterval > 66) {
            return "F";
        } else if (surfaceInterval > 59) {
            return "G";
        } else if (surfaceInterval > 53) {
            return "H";
        } else if (surfaceInterval > 47) {
            return "I";
        } else if (surfaceInterval > 41) {
            return "J";
        } else if (surfaceInterval > 36) {
            return "K";
        } else if (surfaceInterval > 31) {
            return "L";
        } else if (surfaceInterval > 26) {
            return "M";
        } else if (surfaceInterval > 22) {
            return "N";
        } else if (surfaceInterval > 17) {
            return "O";
        } else if (surfaceInterval > 13) {
            return "P";
        } else if (surfaceInterval > 10) {
            return "Q";
        } else if (surfaceInterval > 6) {
            return "R";
        } else if (surfaceInterval > 2) {
            return "S";
        } else {
            return "T";
        }
    } else if (pg == "U") {
        if (surfaceInterval > 345) {
            return "0";
        } else if (surfaceInterval > 164) {
            return "A";
        } else if (surfaceInterval > 116) {
            return "B";
        } else if (surfaceInterval > 94) {
            return "C";
        } else if (surfaceInterval > 85) {
            return "D";
        } else if (surfaceInterval > 77) {
            return "E";
        } else if (surfaceInterval > 69) {
            return "F";
        } else if (surfaceInterval > 62) {
            return "G";
        } else if (surfaceInterval > 56) {
            return "H";
        } else if (surfaceInterval > 50) {
            return "I";
        } else if (surfaceInterval > 44) {
            return "J";
        } else if (surfaceInterval > 39) {
            return "K";
        } else if (surfaceInterval > 34) {
            return "L";
        } else if (surfaceInterval > 29) {
            return "M";
        } else if (surfaceInterval > 25) {
            return "N";
        } else if (surfaceInterval > 21) {
            return "O";
        } else if (surfaceInterval > 17) {
            return "P";
        } else if (surfaceInterval > 13) {
            return "Q";
        } else if (surfaceInterval > 9) {
            return "R";
        } else if (surfaceInterval > 6) {
            return "S";
        } else if (surfaceInterval > 2) {
            return "T";
        } else {
            return "U";
        }
    } else if (pg == "V") {
        if (surfaceInterval > 348) {
            return "0";
        } else if (surfaceInterval > 167) {
            return "A";
        } else if (surfaceInterval > 119) {
            return "B";
        } else if (surfaceInterval > 97) {
            return "C";
        } else if (surfaceInterval > 88) {
            return "D";
        } else if (surfaceInterval > 80) {
            return "E";
        } else if (surfaceInterval > 72) {
            return "F";
        } else if (surfaceInterval > 65) {
            return "G";
        } else if (surfaceInterval > 59) {
            return "H";
        } else if (surfaceInterval > 53) {
            return "I";
        } else if (surfaceInterval > 47) {
            return "J";
        } else if (surfaceInterval > 42) {
            return "K";
        } else if (surfaceInterval > 37) {
            return "L";
        } else if (surfaceInterval > 33) {
            return "M";
        } else if (surfaceInterval > 28) {
            return "N";
        } else if (surfaceInterval > 24) {
            return "O";
        } else if (surfaceInterval > 20) {
            return "P";
        } else if (surfaceInterval > 16) {
            return "Q";
        } else if (surfaceInterval > 12) {
            return "R";
        } else if (surfaceInterval > 9) {
            return "S";
        } else if (surfaceInterval > 5) {
            return "T";
        } else if (surfaceInterval > 2) {
            return "U";
        } else {
            return "V";
        }
    } else if (pg == "W") {
        if (surfaceInterval > 351) {
            return "0";
        } else if (surfaceInterval > 170) {
            return "A";
        } else if (surfaceInterval > 122) {
            return "B";
        } else if (surfaceInterval > 100) {
            return "C";
        } else if (surfaceInterval > 91) {
            return "D";
        } else if (surfaceInterval > 83) {
            return "E";
        } else if (surfaceInterval > 75) {
            return "F";
        } else if (surfaceInterval > 68) {
            return "G";
        } else if (surfaceInterval > 62) {
            return "H";
        } else if (surfaceInterval > 56) {
            return "I";
        } else if (surfaceInterval > 50) {
            return "J";
        } else if (surfaceInterval > 45) {
            return "K";
        } else if (surfaceInterval > 40) {
            return "L";
        } else if (surfaceInterval > 36) {
            return "M";
        } else if (surfaceInterval > 31) {
            return "N";
        } else if (surfaceInterval > 27) {
            return "O";
        } else if (surfaceInterval > 23) {
            return "P";
        } else if (surfaceInterval > 19) {
            return "Q";
        } else if (surfaceInterval > 15) {
            return "R";
        } else if (surfaceInterval > 12) {
            return "S";
        } else if (surfaceInterval > 8) {
            return "T";
        } else if (surfaceInterval > 5) {
            return "U";
        } else if (surfaceInterval > 2) {
            return "V";
        } else {
            return "W";
        }
    } else if (pg == "X") {
        if (surfaceInterval > 354) {
            return "0";
        } else if (surfaceInterval > 173) {
            return "A";
        } else if (surfaceInterval > 125) {
            return "B";
        } else if (surfaceInterval > 103) {
            return "C";
        } else if (surfaceInterval > 94) {
            return "D";
        } else if (surfaceInterval > 86) {
            return "E";
        } else if (surfaceInterval > 78) {
            return "F";
        } else if (surfaceInterval > 71) {
            return "G";
        } else if (surfaceInterval > 65) {
            return "H";
        } else if (surfaceInterval > 59) {
            return "I";
        } else if (surfaceInterval > 53) {
            return "J";
        } else if (surfaceInterval > 48) {
            return "K";
        } else if (surfaceInterval > 43) {
            return "L";
        } else if (surfaceInterval > 39) {
            return "M";
        } else if (surfaceInterval > 34) {
            return "N";
        } else if (surfaceInterval > 30) {
            return "O";
        } else if (surfaceInterval > 26) {
            return "P";
        } else if (surfaceInterval > 22) {
            return "Q";
        } else if (surfaceInterval > 18) {
            return "R";
        } else if (surfaceInterval > 15) {
            return "S";
        } else if (surfaceInterval > 11) {
            return "T";
        } else if (surfaceInterval > 8) {
            return "U";
        } else if (surfaceInterval > 5) {
            return "V";
        } else if (surfaceInterval > 2) {
            return "W";
        } else {
            return "X";
        }
    } else if (pg == "Y") {
        if (surfaceInterval > 357) {
            return "0";
        } else if (surfaceInterval > 176) {
            return "A";
        } else if (surfaceInterval > 128) {
            return "B";
        } else if (surfaceInterval > 106) {
            return "C";
        } else if (surfaceInterval > 97) {
            return "D";
        } else if (surfaceInterval > 89) {
            return "E";
        } else if (surfaceInterval > 81) {
            return "F";
        } else if (surfaceInterval > 74) {
            return "G";
        } else if (surfaceInterval > 68) {
            return "H";
        } else if (surfaceInterval > 62) {
            return "I";
        } else if (surfaceInterval > 56) {
            return "J";
        } else if (surfaceInterval > 51) {
            return "K";
        } else if (surfaceInterval > 46) {
            return "L";
        } else if (surfaceInterval > 41) {
            return "M";
        } else if (surfaceInterval > 37) {
            return "N";
        } else if (surfaceInterval > 33) {
            return "O";
        } else if (surfaceInterval > 29) {
            return "P";
        } else if (surfaceInterval > 25) {
            return "Q";
        } else if (surfaceInterval > 21) {
            return "R";
        } else if (surfaceInterval > 18) {
            return "S";
        } else if (surfaceInterval > 14) {
            return "T";
        } else if (surfaceInterval > 11) {
            return "U";
        } else if (surfaceInterval > 8) {
            return "V";
        } else if (surfaceInterval > 5) {
            return "W";
        } else if (surfaceInterval > 2) {
            return "X";
        } else {
            return "Y";
        }
    } else /* Z */ {
        if (surfaceInterval > 360) {
            return "0";
        } else if (surfaceInterval > 179) {
            return "A";
        } else if (surfaceInterval > 131) {
            return "B";
        } else if (surfaceInterval > 109) {
            return "C";
        } else if (surfaceInterval > 100) {
            return "D";
        } else if (surfaceInterval > 91) {
            return "E";
        } else if (surfaceInterval > 84) {
            return "F";
        } else if (surfaceInterval > 77) {
            return "G";
        } else if (surfaceInterval > 71) {
            return "H";
        } else if (surfaceInterval > 65) {
            return "I";
        } else if (surfaceInterval > 59) {
            return "J";
        } else if (surfaceInterval > 54) {
            return "K";
        } else if (surfaceInterval > 49) {
            return "L";
        } else if (surfaceInterval > 44) {
            return "M";
        } else if (surfaceInterval > 40) {
            return "N";
        } else if (surfaceInterval > 35) {
            return "O";
        } else if (surfaceInterval > 31) {
            return "P";
        } else if (surfaceInterval > 28) {
            return "Q";
        } else if (surfaceInterval > 24) {
            return "R";
        } else if (surfaceInterval > 20) {
            return "S";
        } else if (surfaceInterval > 17) {
            return "T";
        } else if (surfaceInterval > 14) {
            return "U";
        } else if (surfaceInterval > 11) {
            return "V";
        } else if (surfaceInterval > 8) {
            return "W";
        } else if (surfaceInterval > 5) {
            return "X";
        } else if (surfaceInterval > 2) {
            return "Y";
        } else {
            return "Z";
        }
    }
}
