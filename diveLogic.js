/* TODO  - Calculate NDL based on depth and dive tables
#       - Take depth and planned bottom time as input and use the calculated NDL to see if 
#       - you are within the NDL limit and how much buffer time you would have left.

#       - ONCE THATS DONE we try to calculate for repeate dives based on presssure groups, surface interval
#       - we would calculate the new NDL based on the previous dive and surface interval.

#       - THEN make it look super cool with a depth guage the fills as you input depth
#       - A nitrogen tank that fills as you input the planned bottom time

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
    140: 18
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
    if (bottomTime < ndl) {
        console.log("You are within the NDL limit. You have buffer time left.");
        return ndl - bottomTime;
    } else if (bottomTime == ndl) {
        console.log("You have reached your NDL limit.");
        return 0;
    } else {
        console.log("Bottom time exceeds NDL. You are in decompression territory!");
        return null;
    }
}


// MAIN METHOD (GETTING USER INPUT FROM COMMAND LINE)

// process.argv[0] is the Node path
// process.argv[1] is the File path
// process.argv[2] is your first custom argument
const userArgument = process.argv[2];
if (userArgument) {
    console.log(`NDL for ${userArgument} feet: ${getNDL(parseInt(userArgument))} minutes`);
} else if (userArgument) {

} else {
    console.log("Please provide an argument!");
}