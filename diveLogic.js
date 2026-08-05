/* TODO  CREATE A COOL GUI WITH BUTTONS AND INPUTSS TO CALC NDL AND BUFFER TIME 
#       - ONCE THATS DONE we try to calculate for repeate dives based on presssure groups, surface interval
#       - we would calculate the new NDL based on the previous dive and surface interval.
        - put whether or not a safety stop is required

#       - THEN make it look super cool with a depth guage the fills as you input depth
#       - A nitrogen tank that fills as you input the planned bottom time
        - Add bubbles that rise from the scuba diver every 2ish seconds
        - Add the underwater color scale that changes as you go deeper.

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

const slider = document.getElementById("depthSlider");
const minInput = document.getElementById("minIN");
const hrInput = document.getElementById("hrIN");
const diver = document.getElementById("diver");
const depthLabel = document.getElementById("depthLabel");
const containerHeight = 400; 
const ndlLabel = document.getElementById("ndlLabel");
const ssLabel = document.getElementById("ssLabel");

function updateAll() {
  const depth = Number(slider.value);
  depthLabel.innerText = "Depth: " + depth + " ft";
  const percent = (depth - slider.min) / (slider.max - slider.min);
  const pixelPosition = percent * containerHeight;
  diver.style.top = pixelPosition + "px";
  const ndl = getNDL(depth);
  ndlLabel.innerText = "NDL: " + ndl + " mins";
  const bottomTime = getTimeInMins(Number(hrInput.value), Number(minInput.value));
  ssLabel.innerText = "" + safetyStopCheck(depth, bottomTime);
  dpLabel.innerText = "" + calculateBufferTime(depth, bottomTime);
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
