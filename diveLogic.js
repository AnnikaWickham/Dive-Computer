/* TODO  
        - Add bubbles that rise from the scuba diver every 2ish seconds
        - Little Question mark icon to give info about color depth, NDL and safety stop
        - Safety Stop logic for dive 2.
        
#       - SUPER FUTURE implement the actual physics and algs that PADI used to calc the tables
#       - NDL can be affected by water temp, age, weight, gas mixture, exertion, and altitude.
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
    if (depth <= 0 || depth == null) {
        depth = 35;
    }
    if (Number.isInteger(depth) && depth >= 35 && depth <= 140) {
        let ndl = ndlTable[depth];
        while (ndl == undefined) {
            depth--;
            ndl = ndlTable[depth];
        }
        return ndl;
    } else {
        return "--";
    }
}

// Writes how safe the dive is and whatever buffertime the diver might have.
function diveSafety(bufferTime) {
    const numSpan = (n) => `<span style="color: #ff7c7c;">${n}</span>`;
    let html;
    if (bufferTime > 5) {
        html = `Your current dive plan looks good. You have ${numSpan(bufferTime)} minutes of buffer time. Have a fun and safe dive!`;
    } else if (bufferTime >= 0) {
        html = `Your current dive plan is safe but you are close to your NDL limit. You have ${numSpan(bufferTime)} minutes of buffer time.`;
    } else {
        html = `Your current dive plan is unsafe. You exceeded your NDL limit by ${numSpan(-bufferTime)} minutes. Ascend to a shallower depth or decrease dive time.`;
    }
    document.getElementById("dpText").innerHTML = html;
    return html;
}

//// Writes how safe the dive is in fewer words.
function diveSafetyShort(bufferTime) {
    if (bufferTime > 5) {
        return "Safe";
    } else if (bufferTime >= 0) {
        return "Borderline";
    } else {
        return "Unsafe";
    }
}

// Calculates the buffertime between NDL limit and the divers bottom time.
function calcBufferTimeByNDL(ndl, bottomTime) {
    if ((bottomTime+5) < ndl) {
        return (ndl - bottomTime);
    } else if (bottomTime <= ndl) {
        return (ndl - bottomTime);
    } else {
        return (ndl - bottomTime);
    }
}

// Calculates how full the Nitrogen Visual should be based on ndl and buffer time
function dudePercent(depth, bottomTime) {
    let time = bottomTime;
    if (bottomTime == 0) {
        time = 1;
    }
    const ndl = getNDL(depth);
    const buffTime =  ndl - time;
    let percent;
    if (buffTime == 0) {
        percent = 30;
    } else if (buffTime < 0) {
        percent = 30 + (2*buffTime);
    } else {
        percent = ((buffTime) / ndl) * 70 + 30;
    }

    return Math.max(0, Math.min(100, percent));
}

//Calculates what color the fill should be for the nitrogen visual
function dudeColor(dudePercent) {
    if (dudePercent < 30) {
        return 'drop-shadow(0 0 0 rgb(255, 0, 0)) drop-shadow(0 0 0 rgb(255, 0, 0))';
    } else if (dudePercent <= 35) {
        return 'drop-shadow(0 0 0 rgb(255, 140, 0)) drop-shadow(0 0 0 rgb(255, 191, 0))';
    } else {
        return 'drop-shadow(0 0 0 rgb(0, 255, 0)) drop-shadow(0 0 0 rgb(0, 255, 0))';
    }
}

//Takes a startColor, endColor, and percent. The higher the percent the closer the color is to the ending color
// Used for color at depth graphic.
function lerpColor(startColor, endColor, percent) {
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percent);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percent);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percent);
  return `rgb(${r}, ${g}, ${b})`;
}

//Gets the start & end colors based on color and depth (uses lerpColor)
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

// Updates EVERYTHING needed for the Single Dive Screen
const slider = document.getElementById("depthSlider");
const minInput = document.getElementById("minIN");
const diver = document.getElementById("diver");
const depthLabel = document.getElementById("depthLabel");
const containerHeight = 460; 
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
const dude = document.getElementById("headless");
let bottomTime = 0;
let depth = 35;

function updateAll() {
  depth = Number(slider.value);
  depthLabel.innerText = "Depth: " + depth + " ft";
  colorLabel.innerText = "Colors At Depth " + depth + "ft:";
  const percent = (depth - slider.min) / (slider.max - slider.min);
  const pixelPosition = percent * containerHeight;
  diver.style.top = pixelPosition + "px";
  ndlLabel.innerText = getNDL(depth);
  bottomTime = Number(minInput.value);
  ssLabel.innerText = "" + safetyStopCheck(depth, bottomTime);
  diveSafety(calcBufferTimeByNDL(getNDL(depth), bottomTime));
  redC.style.backgroundColor = getDepthColor("red", depth);
  orangeC.style.backgroundColor = getDepthColor("orange", depth);
  yellowC.style.backgroundColor = getDepthColor("yellow", depth);
  greenC.style.backgroundColor = getDepthColor("green", depth);
  blueC.style.backgroundColor = getDepthColor("blue", depth);
  purpleC.style.backgroundColor = getDepthColor("purple", depth);
  pinkC.style.backgroundColor = getDepthColor("pink", depth);
  const dudeP = dudePercent(depth, bottomTime);
  dude.style.clipPath = `inset(${dudeP}% 0 0 0)`;
  dude.style.filter = dudeColor(dudeP);
}
slider.addEventListener("input", updateAll);
minInput.addEventListener("input", updateAll);

//Updates EVERYTHING for the Multi Dive Screen
const depthM = document.getElementById("depthM");
const mins = document.getElementById("mins");
const ndl = document.getElementById("ndl");
const safeStop = document.getElementById("safeStop");
const divePlan = document.getElementById("divePlan");
const bufferTime = document.getElementById("bufferTime");
const pressGroup = document.getElementById("pressGroup");
const pressGroup2 = document.getElementById("pressGroup2");
function updateAllMulti(){
    const d = Number(depthM.value);
    const time = Number(mins.value);
    const ndlM = getNDL(d);
    const pg = getPG(d, time);
    ndl.innerText = ndlM;
    safeStop.innerText = "" + safetyStopCheck(d, time);
    const bT = calcBufferTimeByNDL(ndlM, time);
    divePlan.innerText = diveSafetyShort(bT);
    bufferTime.innerText = bT;
    pressGroup.innerText = pg;
    const surTime = getTimeInMins(Number(hoursSI.value), Number(minsSI.value));
    pressGroup2.innerText = pgTransformer(pg, surTime);
}

//Updates EVERYTHING for the Multi Dive Screen (Dive 2 section)
const ndlNew = document.getElementById("ndlNew");
const dive2Plan = document.getElementById("dive2Plan");
const bufferTime2 = document.getElementById("bufferTime2");
const fPG = document.getElementById("finalPG");
function updateDive2Info(){
    const d = Number(depthM.value);
    const time = Number(mins.value);
    const pg = getPG(d, time);
    const surTime = getTimeInMins(Number(hoursSI.value), Number(minsSI.value));
    const pg2 = pgTransformer(pg, surTime);
    const d2 = Number(depth2.value);
    const time2 = Number(mins2.value);
    const nrt = calcRNT(pg2, d2)
    const ndl2 = newNDL(d2, nrt);
    ndlNew.innerText = ndl2;
    const bT = calcBufferTimeByNDL(ndl2, time2);
    dive2Plan.innerText = diveSafetyShort(bT);
    bufferTime2.innerText = bT;
    fPG.innerText = finalPG(d2,nrt,time2);
}
depthM.addEventListener("input", updateAllMulti);
mins.addEventListener("input", updateAllMulti);
hoursSI.addEventListener("input", updateAllMulti);
minsSI.addEventListener("input", updateAllMulti);
hoursSI.addEventListener("input", updateDive2Info);
minsSI.addEventListener("input", updateDive2Info);
depth2.addEventListener("input", updateDive2Info);
mins2.addEventListener("input", updateDive2Info);

// Buttons for the different "tabs"
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

// Function to determine if a safety stop is necessary
function safetyStopCheck(depth, bottomTime) {
    if (depth >= 100) {
        return "Required";
    } else if (depth > 90 && bottomTime >= 22) {
        return "Required";
    } else if (depth > 80 && bottomTime >= 26) {
        return "Required";
    } else if (depth > 70 && bottomTime >= 35) {
        return "Required";
    } else if (depth > 60 && bottomTime >= 49) {
        return "Required";
    } else if (depth > 50 && bottomTime >= 67) {
        return "Required";
    } else if (depth > 40 && bottomTime >= 111) {
        return "Required";
    } else if (depth > 35 && bottomTime >= 152) {
        return "Required";
    } else {
        return "Recommended";
    }
}

// determines if a safety stop is necessary for the second dive based on presssure groups.
function safetyStopDive2(pg1, pg2, depth) {
    if (depth >= 100) {
        return "Required";
    }
    if (pg1 == "A") {
        if (pg2 == "A") {
            return "Required";
        }
    } else if (pg1 == "B") {
        if (pg2 == "B" || pg2 == "A") {
            return "Required";
        }
    } else if (pg1 == "C") {
        if (pg2 == "C" || pg2 == "B" || pg2 == "A") {
            return "Required";
        }
    } else if (pg1 == "D") {
        if (pg2 == "D" || pg2 == "C" || pg2 == "B" || pg2 == "A") {
            return "Required";
        }
    } else if (pg1 == "E") {
        if (pg2 == "D" || pg2 == "C" || pg2 == "B" || pg2 == "E") {
            return "Required";
        }
    } else if (pg1 == "F") {
        if (pg2 == "D" || pg2 == "C" || pg2 == "F" || pg2 == "E") {
            return "Required";
        }
    } else if (pg1 == "G") {
        if (pg2 == "D" || pg2 == "G" || pg2 == "F" || pg2 == "E") {
            return "Required";
        }
    } else if (pg1 == "H") {
        if (pg2 == "H" || pg2 == "G" || pg2 == "F" || pg2 == "E") {
            return "Required";
        }
    } else if (pg1 == "I") {
        if (pg2 == "H" || pg2 == "G" || pg2 == "F" || pg2 == "I") {
            return "Required";
        }
    } else if (pg1 == "J") {
        if (pg2 == "H" || pg2 == "G" || pg2 == "J" || pg2 == "I") {
            return "Required";
        }
    } else if (pg1 == "K") {
        if (pg2 == "H" || pg2 == "K" || pg2 == "J" || pg2 == "I") {
            return "Required";
        }
    } else if (pg1 == "L") {
        if (pg2 == "L" || pg2 == "K" || pg2 == "J" || pg2 == "I") {
            return "Required";
        }
    } else if (pg1 == "M") {
        if (pg2 == "L" || pg2 == "K" || pg2 == "J" || pg2 == "M") {
            return "Required";
        }
    } else if (pg1 == "N") {
        if (pg2 == "L" || pg2 == "K" || pg2 == "N" || pg2 == "M") {
            return "Required";
        }
    } else if (pg1 == "O") {
        if (pg2 == "L" || pg2 == "O" || pg2 == "N" || pg2 == "M") {
            return "Required";
        }
    } else if (pg1 == "P") {
        if (pg2 == "P" || pg2 == "O" || pg2 == "N" || pg2 == "M") {
            return "Required";
        }
    } else if (pg1 == "Q") {
        if (pg2 == "P" || pg2 == "O" || pg2 == "N" || pg2 == "Q") {
            return "Required";
        }
    } else if (pg1 == "R") {
        if (pg2 == "P" || pg2 == "O" || pg2 == "R" || pg2 == "Q") {
            return "Required";
        }
    } else if (pg1 == "S") {
        if (pg2 == "P" || pg2 == "S" || pg2 == "R" || pg2 == "Q") {
            return "Required";
        }
    } else if (pg1 == "T") {
        if (pg2 == "T" || pg2 == "S" || pg2 == "R" || pg2 == "Q") {
            return "Required";
        }
    } else if (pg1 == "U") {
        if (pg2 == "T" || pg2 == "S" || pg2 == "R" || pg2 == "U") {
            return "Required";
        }
    } else if (pg1 == "V") {
        if (pg2 == "T" || pg2 == "S" || pg2 == "V" || pg2 == "U") {
            return "Required";
        }
    } else if (pg1 == "W") {
        if (pg2 == "T" || pg2 == "W" || pg2 == "V" || pg2 == "U") {
            return "Required";
        }
    } else if (pg1 == "X") {
        if (pg2 == "X" || pg2 == "W" || pg2 == "V" || pg2 == "U") {
            return "Required";
        }
    } else if (pg1 == "Y") {
        if (pg2 == "X" || pg2 == "W" || pg2 == "V" || pg2 == "Y") {
            return "Required";
        }
    } else if (pg1 == "Z") {
        if (pg2 == "X" || pg2 == "W" || pg2 == "Z" || pg2 == "Y") {
            return "Required";
        }
    } else {
        return "Recommended";
    }
}

//Converts hours+mins to just mins
function getTimeInMins(hours, minutes) {
    return (hours * 60) + minutes;
}

//Returns the pressure group after the first dive. 
// Returns "A" - "Z" OR "--" if the first dive exceeds the NDL time
function getPG(depth, bottomTime) {
    if (bottomTime == null) {
        bottomTime = 0;
    }
    if (depth == 35) {
        if (bottomTime >= 205) {
            return "Z";
        } else if (bottomTime >= 188) {
            return "Y";
        } else if (bottomTime >= 168) {
            return "X";
        } else if (bottomTime >= 152) {
            return "W";
        } else if (bottomTime >= 139) {
            return "V";
        } else if (bottomTime >= 127) {
            return "U";
        } else if (bottomTime >= 117) {
            return "T";
        } else if (bottomTime >= 108) {
            return "S";
        } else if (bottomTime >= 100) {
            return "R";
        } else if (bottomTime >= 92) {
            return "Q";
        } else if (bottomTime >= 85) {
            return "P";
        } else if (bottomTime >= 79) {
            return "O";
        } else if (bottomTime >= 73) {
            return "N";
        } else if (bottomTime >= 67) {
            return "M";
        } else if (bottomTime >= 62) {
            return "L";
        } else if (bottomTime >= 57) {
            return "K";
        } else if (bottomTime >= 52) {
            return "J";
        } else if (bottomTime >= 48) {
            return "I";
        } else if (bottomTime >= 44) {
            return "H";
        } else if (bottomTime >= 40) {
            return "G";
        } else if (bottomTime >= 36) {
            return "F";
        } else if (bottomTime >= 32) {
            return "E";
        } else if (bottomTime >= 29) {
            return "D";
        } else if (bottomTime >= 25) {
            return "C";
        } else if (bottomTime >= 19) {
            return "B";
        } else if (bottomTime >= 10) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 40) {
        if (bottomTime >= 140) {
            return "Z";
        } else if (bottomTime >= 129) {
            return "Y";
        } else if (bottomTime >= 120) {
            return "X";
        } else if (bottomTime >= 111) {
            return "W";
        } else if (bottomTime >= 104) {
            return "V";
        } else if (bottomTime >= 97) {
            return "U";
        } else if (bottomTime >= 91) {
            return "T";
        } else if (bottomTime >= 85) {
            return "S";
        } else if (bottomTime >= 79) {
            return "R";
        } else if (bottomTime >= 74) {
            return "Q";
        } else if (bottomTime >= 69) {
            return "P";
        } else if (bottomTime >= 64) {
            return "O";
        } else if (bottomTime >= 60) {
            return "N";
        } else if (bottomTime >= 55) {
            return "M";
        } else if (bottomTime >= 51) {
            return "L";
        } else if (bottomTime >= 48) {
            return "K";
        } else if (bottomTime >= 44) {
            return "J";
        } else if (bottomTime >= 40) {
            return "I";
        } else if (bottomTime >= 37) {
            return "H";
        } else if (bottomTime >= 34) {
            return "G";
        } else if (bottomTime >= 31) {
            return "F";
        } else if (bottomTime >= 27) {
            return "E";
        } else if (bottomTime >= 25) {
            return "D";
        } else if (bottomTime >= 22) {
            return "C";
        } else if (bottomTime >= 16) {
            return "B";
        } else if (bottomTime >= 9) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 50) {
        if (bottomTime >= 80) {
            return "X";
        } else if (bottomTime >= 75) {
            return "W";
        } else if (bottomTime >= 71) {
            return "V";
        } else if (bottomTime >= 67) {
            return "U";
        } else if (bottomTime >= 63) {
            return "T";
        } else if (bottomTime >= 60) {
            return "S";
        } else if (bottomTime >= 57) {
            return "R";
        } else if (bottomTime >= 53) {
            return "Q";
        } else if (bottomTime >= 50) {
            return "P";
        } else if (bottomTime >= 47) {
            return "O";
        } else if (bottomTime >= 44) {
            return "N";
        } else if (bottomTime >= 41) {
            return "M";
        } else if (bottomTime >= 39) {
            return "L";
        } else if (bottomTime >= 36) {
            return "K";
        } else if (bottomTime >= 33) {
            return "J";
        } else if (bottomTime >= 31) {
            return "I";
        } else if (bottomTime >= 28) {
            return "H";
        } else if (bottomTime >= 26) {
            return "G";
        } else if (bottomTime >= 24) {
            return "F";
        } else if (bottomTime >= 21) {
            return "E";
        } else if (bottomTime >= 19) {
            return "D";
        } else if (bottomTime >= 17) {
            return "C";
        } else if (bottomTime >= 13) {
            return "B";
        } else if (bottomTime >= 7) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 60) {
        if (bottomTime >= 55) {
            return "W";
        } else if (bottomTime >= 54) {
            return "V";
        } else if (bottomTime >= 52) {
            return "U";
        } else if (bottomTime >= 49) {
            return "T";
        } else if (bottomTime >= 47) {
            return "S";
        } else if (bottomTime >= 44) {
            return "R";
        } else if (bottomTime >= 42) {
            return "Q";
        } else if (bottomTime >= 39) {
            return "P";
        } else if (bottomTime >= 37) {
            return "O";
        } else if (bottomTime >= 35) {
            return "N";
        } else if (bottomTime >= 33) {
            return "M";
        } else if (bottomTime >= 31) {
            return "L";
        } else if (bottomTime >= 29) {
            return "K";
        } else if (bottomTime >= 27) {
            return "J";
        } else if (bottomTime >= 25) {
            return "I";
        } else if (bottomTime >= 23) {
            return "H";
        } else if (bottomTime >= 21) {
            return "G";
        } else if (bottomTime >= 19) {
            return "F";
        } else if (bottomTime >= 17) {
            return "E";
        } else if (bottomTime >= 16) {
            return "D";
        } else if (bottomTime >= 14) {
            return "C";
        } else if (bottomTime >= 11) {
            return "B";
        } else if (bottomTime >= 6) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 70) {
        if (bottomTime >= 40) {
            return "T";
        } else if (bottomTime >= 38) {
            return "S";
        } else if (bottomTime >= 36) {
            return "R";
        } else if (bottomTime >= 35) {
            return "Q";
        } else if (bottomTime >= 33) {
            return "P";
        } else if (bottomTime >= 31) {
            return "O";
        } else if (bottomTime >= 29) {
            return "N";
        } else if (bottomTime >= 27) {
            return "M";
        } else if (bottomTime >= 26) {
            return "L";
        } else if (bottomTime >= 24) {
            return "K";
        } else if (bottomTime >= 22) {
            return "J";
        } else if (bottomTime >= 21) {
            return "I";
        } else if (bottomTime >= 19) {
            return "H";
        } else if (bottomTime >= 18) {
            return "G";
        } else if (bottomTime >= 17) {
            return "F";
        } else if (bottomTime >= 15) {
            return "E";
        } else if (bottomTime >= 13) {
            return "D";
        } else if (bottomTime >= 12) {
            return "C";
        } else if (bottomTime >= 9) {
            return "B";
        } else if (bottomTime >= 5) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 80) {
        if (bottomTime >= 30) {
            return "R";
        } else if (bottomTime >= 29) {
            return "Q";
        } else if (bottomTime >= 28) {
            return "P";
        } else if (bottomTime >= 26) {
            return "O";
        } else if (bottomTime >= 25) {
            return "N";
        } else if (bottomTime >= 23) {
            return "M";
        } else if (bottomTime >= 22) {
            return "L";
        } else if (bottomTime >= 21) {
            return "K";
        } else if (bottomTime >= 19) {
            return "J";
        } else if (bottomTime >= 18) {
            return "I";
        } else if (bottomTime >= 17) {
            return "H";
        } else if (bottomTime >= 15) {
            return "G";
        } else if (bottomTime >= 14) {
            return "F";
        } else if (bottomTime >= 13) {
            return "E";
        } else if (bottomTime >= 11) {
            return "D";
        } else if (bottomTime >= 10) {
            return "C";
        } else if (bottomTime >= 8) {
            return "B";
        } else if (bottomTime >= 4) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 90) {
        if (bottomTime >= 25) {
            return "Q";
        } else if (bottomTime >= 24) {
            return "P";
        } else if (bottomTime >= 23) {
            return "O";
        } else if (bottomTime >= 22) {
            return "N";
        } else if (bottomTime >= 21) {
            return "M";
        } else if (bottomTime >= 19) {
            return "L";
        } else if (bottomTime >= 18) {
            return "K";
        } else if (bottomTime >= 17) {
            return "J";
        } else if (bottomTime >= 16) {
            return "I";
        } else if (bottomTime >= 15) {
            return "H";
        } else if (bottomTime >= 13) {
            return "G";
        } else if (bottomTime >= 12) {
            return "F";
        } else if (bottomTime >= 11) {
            return "E";
        } else if (bottomTime >= 10) {
            return "D";
        } else if (bottomTime >= 9) {
            return "C";
        } else if (bottomTime >= 7) {
            return "B";
        } else if (bottomTime >= 4) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 100) {
        if (bottomTime >= 20) {
            return "O";
        } else if (bottomTime >= 19) {
            return "N";
        } else if (bottomTime >= 18) {
            return "M";
        } else if (bottomTime >= 17) {
            return "L";
        } else if (bottomTime >= 16) {
            return "K";
        } else if (bottomTime >= 15) {
            return "J";
        } else if (bottomTime >= 14) {
            return "I";
        } else if (bottomTime >= 13) {
            return "H";
        } else if (bottomTime >= 12) {
            return "G";
        } else if (bottomTime >= 11) {
            return "F";
        } else if (bottomTime >= 10) {
            return "E";
        } else if (bottomTime >= 9) {
            return "D";
        } else if (bottomTime >= 8) {
            return "C";
        } else if (bottomTime >= 6) {
            return "B";
        } else if (bottomTime >= 3) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 110) {
        if (bottomTime >= 16) {
            return "M";
        } else if (bottomTime >= 15) {
            return "L";
        } else if (bottomTime >= 14) {
            return "K";
        } else if (bottomTime >= 13) {
            return "I";
        } else if (bottomTime >= 12) {
            return "H";
        } else if (bottomTime >= 11) {
            return "G";
        } else if (bottomTime >= 10) {
            return "F";
        } else if (bottomTime >= 9) {
            return "E";
        } else if (bottomTime >= 8) {
            return "D";
        } else if (bottomTime >= 7) {
            return "C";
        } else if (bottomTime >= 6) {
            return "B";
        } else if (bottomTime >= 3) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 120) {
        if (bottomTime >= 13) {
            return "K";
        } else if (bottomTime >= 12) {
            return "J";
        } else if (bottomTime >= 11) {
            return "H";
        } else if (bottomTime >= 10) {
            return "G";
        } else if (bottomTime >= 9) {
            return "F";
        } else if (bottomTime >= 8) {
            return "E";
        } else if (bottomTime >= 7) {
            return "D";
        } else if (bottomTime >= 6) {
            return "C";
        } else if (bottomTime >= 5) {
            return "B";
        } else if (bottomTime >= 3) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 130) {
        if (bottomTime >= 10) {
            return "H";
        } else if (bottomTime >= 9) {
            return "G";
        } else if (bottomTime >= 8) {
            return "F";
        } else if (bottomTime >= 7) {
            return "D";
        } else if (bottomTime >= 6) {
            return "C";
        } else if (bottomTime >= 5) {
            return "B";
        } else if (bottomTime >= 3) {
            return "A";
        } else {
            return "None";
        }
    } else if (depth <= 140) {
        if (bottomTime >= 8) {
            return "F";
        } else if (bottomTime >= 7) {
            return "E";
        } else if (bottomTime >= 6) {
            return "D";
        } else if (bottomTime >= 5) {
            return "C";
        } else if (bottomTime >= 4) {
            return "B";
        } else if (bottomTime >= 0) {
            return "A";
        } else {
            return "None";
        }
    } else {
        return "--";
    }
}

// This function takes the current pressure group and outputs the new pressure group based on the surface interval.
// Values straight from the PADI dive table. 
// INPUTS: pg = current pressure group (A-Z), surfaceInterval = time in mins
// OUTPUT: new pressure group (A-Z) OR "None" if the diver is fully off-gassed OR "--" if the input is not (A-Z)
function pgTransformer(pg, surfaceInterval) {
    if (pg == "A") {
        if (surfaceInterval > 3) {
            return "None";
        } else {
            return "A";
        }
    } else if (pg == "B") {
        if (surfaceInterval > 228) {
            return "None";
        } else if (surfaceInterval > 47) {
            return "A";
        } else {
            return "B";
        }
    } else if (pg == "C") {
        if (surfaceInterval > 250) {
            return "None";
        } else if (surfaceInterval > 69) {
            return "A";
        } else if (surfaceInterval > 21) {
            return "B";
        } else {
            return "C";
        }
    } else if (pg == "D") {
        if (surfaceInterval > 259) {
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
            return "None";
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
    } else if (pg == "Z") {
        if (surfaceInterval > 360) {
            return "None";
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
    } else {
        return "--";
    }
}

//Calcs residual nitrogen time based on pg and depth
function calcRNT(pg, depth) {
    if (pg == "Z") {
        if (depth < 40) {
            return 205;
        } else {
            return 140;
        }
    } else if (pg == "Y") {
        if (depth < 40) {
            return 188;
        } else {
            return 129;
        }
    } else if (pg == "X") {
        if (depth < 40) {
            return 168;
        } else if (depth < 50) {
            return 120;
        } else {
            return 80;
        }
    } else if (pg == "W") {
        if (depth < 40) {
            return 152;
        } else if (depth < 50) {
            return 111;
        } else if (depth < 60) {
            return 75;
        } else {
            return 55;
        }
    } else if (pg == "V") {
        if (depth < 40) {
            return 139;
        } else if (depth < 50) {
            return 104;
        } else if (depth < 60) {
            return 71;
        } else {
            return 54;
        }
    } else if (pg == "U") {
        if (depth < 40) {
            return 127;
        } else if (depth < 50) {
            return 97;
        } else if (depth < 60) {
            return 67;
        } else {
            return 52;
        }
    } else if (pg == "T") {
        if (depth < 40) {
            return 117;
        } else if (depth < 50) {
            return 91;
        } else if (depth < 60) {
            return 63;
        } else if (depth < 70) {
            return 49;
        } else {
            return 40;
        }
    } else if (pg == "S") {
        if (depth < 40) {
            return 108;
        } else if (depth < 50) {
            return 85;
        } else if (depth < 60) {
            return 60;
        } else if (depth < 70) {
            return 47;
        } else {
            return 38;
        }
    } else if (pg == "R") {
        if (depth < 40) {
            return 100;
        } else if (depth < 50) {
            return 79;
        } else if (depth < 60) {
            return 57;
        } else if (depth < 70) {
            return 44;
        } else if (depth < 80) {
            return 36;
        } else {
            return 30;
        }
    } else if (pg == "Q") {
        if (depth < 40) {
            return 92;
        } else if (depth < 50) {
            return 74;
        } else if (depth < 60) {
            return 53;
        } else if (depth < 70) {
            return 42;
        } else if (depth < 80) {
            return 34;
        } else if (depth < 90) {
            return 29;
        } else {
            return 25;
        }
    } else if (pg == "P") {
        if (depth < 40) {
            return 85;
        } else if (depth < 50) {
            return 69;
        } else if (depth < 60) {
            return 50;
        } else if (depth < 70) {
            return 39;
        } else if (depth < 80) {
            return 33;
        } else if (depth < 90) {
            return 28;
        } else {
            return 24;
        }
    } else if (pg == "O") {
        if (depth < 40) {
            return 79;
        } else if (depth < 50) {
            return 64;
        } else if (depth < 60) {
            return 47;
        } else if (depth < 70) {
            return 37;
        } else if (depth < 80) {
            return 31;
        } else if (depth < 90) {
            return 26;
        } else if (depth < 100) {
            return 23;
        } else {
            return 20;
        }
    } else if (pg == "N") {
        if (depth < 40) {
            return 73;
        } else if (depth < 50) {
            return 60;
        } else if (depth < 60) {
            return 44;
        } else if (depth < 70) {
            return 35;
        } else if (depth < 80) {
            return 29;
        } else if (depth < 90) {
            return 25;
        } else if (depth < 100) {
            return 22;
        } else {
            return 19;
        }
    } else if (pg == "M") {
        if (depth < 40) {
            return 67;
        } else if (depth < 50) {
            return 55;
        } else if (depth < 60) {
            return 41;
        } else if (depth < 70) {
            return 33;
        } else if (depth < 80) {
            return 27;
        } else if (depth < 90) {
            return 23;
        } else if (depth < 100) {
            return 21;
        } else if (depth < 110) {
            return 18;
        } else {
            return 16;
        }
    } else if (pg == "L") {
        if (depth < 40) {
            return 62;
        } else if (depth < 50) {
            return 51;
        } else if (depth < 60) {
            return 38;
        } else if (depth < 70) {
            return 31;
        } else if (depth < 80) {
            return 26;
        } else if (depth < 90) {
            return 22;
        } else if (depth < 100) {
            return 19;
        } else if (depth < 110) {
            return 17;
        } else {
            return 15;
        }
    } else if (pg == "K") {
        if (depth < 40) {
            return 57;
        } else if (depth < 50) {
            return 48;
        } else if (depth < 60) {
            return 36;
        } else if (depth < 70) {
            return 29;
        } else if (depth < 80) {
            return 24;
        } else if (depth < 90) {
            return 21;
        } else if (depth < 100) {
            return 18;
        } else if (depth < 110) {
            return 16;
        } else if (depth < 120) {
            return 14;
        } else {
            return 13;
        }
    } else if (pg == "J") {
        if (depth < 40) {
            return 52;
        } else if (depth < 50) {
            return 44;
        } else if (depth < 60) {
            return 33;
        } else if (depth < 70) {
            return 27;
        } else if (depth < 80) {
            return 22;
        } else if (depth < 90) {
            return 19;
        } else if (depth < 100) {
            return 17;
        } else if (depth < 110) {
            return 15;
        } else if (depth < 120) {
            return 14;
        } else {
            return 12;
        }
    } else if (pg == "I") {
        if (depth < 40) {
            return 48;
        } else if (depth < 50) {
            return 40;
        } else if (depth < 60) {
            return 31;
        } else if (depth < 70) {
            return 25;
        } else if (depth < 80) {
            return 21;
        } else if (depth < 90) {
            return 18;
        } else if (depth < 100) {
            return 16;
        } else if (depth < 110) {
            return 14;
        } else if (depth < 120) {
            return 13;
        } else {
            return 12;
        }
    } else if (pg == "H") {
        if (depth < 40) {
            return 44;
        } else if (depth < 50) {
            return 37;
        } else if (depth < 60) {
            return 28;
        } else if (depth < 70) {
            return 23;
        } else if (depth < 80) {
            return 19;
        } else if (depth < 90) {
            return 17;
        } else if (depth < 100) {
            return 15;
        } else if (depth < 110) {
            return 13;
        } else if (depth < 120) {
            return 12;
        } else if (depth < 130) {
            return 11;
        } else {
            return 10;
        }
    } else if (pg == "G") {
        if (depth < 40) {
            return 40;
        } else if (depth < 50) {
            return 34;
        } else if (depth < 60) {
            return 26;
        } else if (depth < 70) {
            return 21;
        } else if (depth < 80) {
            return 18;
        } else if (depth < 90) {
            return 15;
        } else if (depth < 100) {
            return 13;
        } else if (depth < 110) {
            return 12;
        } else if (depth < 120) {
            return 11;
        } else if (depth < 130) {
            return 10;
        } else {
            return 9;
        }
    } else if (pg == "F") {
        if (depth < 40) {
            return 36;
        } else if (depth < 50) {
            return 31;
        } else if (depth < 60) {
            return 24;
        } else if (depth < 70) {
            return 19;
        } else if (depth < 80) {
            return 16;
        } else if (depth < 90) {
            return 14;
        } else if (depth < 100) {
            return 12;
        } else if (depth < 110) {
            return 11;
        } else if (depth < 120) {
            return 10;
        } else if (depth < 130) {
            return 9;
        } else {
            return 8;
        }
    } else if (pg == "E") {
        if (depth < 40) {
            return 32;
        } else if (depth < 50) {
            return 27;
        } else if (depth < 60) {
            return 21;
        } else if (depth < 70) {
            return 17;
        } else if (depth < 80) {
            return 15;
        } else if (depth < 90) {
            return 13;
        } else if (depth < 100) {
            return 11;
        } else if (depth < 110) {
            return 10;
        } else if (depth < 120) {
            return 9;
        } else {
            return 8;
        }
    } else if (pg == "D") {
        if (depth < 40) {
            return 29;
        } else if (depth < 50) {
            return 25;
        } else if (depth < 60) {
            return 19;
        } else if (depth < 70) {
            return 16;
        } else if (depth < 80) {
            return 13;
        } else if (depth < 90) {
            return 11;
        } else if (depth < 100) {
            return 10;
        } else if (depth < 110) {
            return 9;
        } else if (depth < 120) {
            return 8;
        } else {
            return 7;
        }
    } else if (pg == "C") {
        if (depth < 40) {
            return 25;
        } else if (depth < 50) {
            return 22;
        } else if (depth < 60) {
            return 17;
        } else if (depth < 70) {
            return 14;
        } else if (depth < 80) {
            return 12;
        } else if (depth < 90) {
            return 10;
        } else if (depth < 100) {
            return 9;
        } else if (depth < 110) {
            return 8;
        } else if (depth < 120) {
            return 7;
        } else {
            return 6;
        }
    } else if (pg == "B") {
        if (depth < 40) {
            return 19;
        } else if (depth < 50) {
            return 16;
        } else if (depth < 60) {
            return 13;
        } else if (depth < 70) {
            return 11;
        } else if (depth < 80) {
            return 9;
        } else if (depth < 90) {
            return 8;
        } else if (depth < 100) {
            return 7;
        } else if (depth < 120) {
            return 6;
        } else {
            return 5;
        }
    } else if (pg == "A") {
        if (depth < 40) {
            return 10;
        } else if (depth < 50) {
            return 9;
        } else if (depth < 60) {
            return 7;
        } else if (depth < 70) {
            return 6;
        } else if (depth < 80) {
            return 5;
        } else if (depth < 100) {
            return 4;
        } else {
            return 3;
        }
    } else {
        return "None";
    }
}

function finalPG(depth, nrt, bottomTime) {
    if (depth <= 35 || depth == null) {
        depth = 35;
    }
    if (bottomTime == 0) {
        return getPG(depth, 0);
    }
    if (nrt == "None") {
        return getPG(depth, bottomTime);
    }
    return getPG(depth, (bottomTime + nrt));
}

// calcs new NDL based on depth and nrt
function newNDL(depth, nrt) {
    if (nrt == "None") {
        return getNDL(depth);
    }
    const ans = getNDL(depth) - nrt;
    if (ans < 0) {
        return 0;
    } else if (ans >= 0) {
        return ans;
    } else {
        return "--";
    }
}

//Changes the scale of everything based on the scale of the window
const appWrapper = document.getElementById("appWrapper");
const designWidth = 1320; // must match the width above
function updateScale() {
  const scale = window.innerWidth / designWidth;
  appWrapper.style.transform = `scale(${scale})`;
}
updateScale();
window.addEventListener("resize", updateScale);