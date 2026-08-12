🤿 Dive Computer

An interactive scuba dive planner and visualization tool built with HTML, CSS, and JavaScript. It calculates no-decompression limits (NDL) based on PADI recreational dive tables, visualizes nitrogen buildup, and shows how colors fade with depth — all live, as you adjust the inputs. It also lets you plan multiple dives in the same day and see how your nitrogen pressure groups affect future dives.

HOW TO RUN IT:
1. Live Demo → [test it out with this link] (https://annikawickham.github.io/Dive-Computer/)
or
1. Clone or download this repo.
2. Open index.html directly in any browser (double-click it, or drag it into a browser window).


Features
Single Dive Planner — drag a depth slider (or type a number) and enter your planned bottom time to instantly see your NDL, buffer time, and safety stop recommendation.
Animated diver — a diver sprite moves in real time with the depth slider.
Nitrogen visual — a body-shaped fill graphic shows how close you are to your NDL Limit at a glance.
Color-at-depth visualizer — shows how the color spectrum shifts and fades the deeper you go, compared to colors at the surface.
Multi-Dive Planner — plans a repeat dive by calculating pressure groups and adjusting your second dive's NDL based on your first dive and surface interval.
Link to Padi Tables — see what my code is based off of and double check results for safety.


TECH STACK:
HTML / CSS / JavaScript (no frameworks or libraries)
PADI recreational dive table values
Google Fonts (Coiny)

WHAT THIS PROJECT INVOLVED:
First project using HTML or JavaScript so lots of learning how the languages work
Building lookup-table logic for real-world dive planning math (NDL, safety stops, buffer time)
DOM manipulation and live UI updates driven by multiple synced inputs
CSS animations (clip-path, translate) for the nitrogen fill, and diver movement
Color interpolation (RGB/HSL lerping) to simulate underwater light loss
Debugging real bugs across HTML/CSS/JS — scope issues, event listener timing, z-index stacking, sign errors in math logic


CREDITS:
Diver sprite: (https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTegdAXTzZnQbex6VM_FMapk1G1CSusCtHrI8gxKm6LpA&s=10)
Boat sprite: (https://thumbs.dreamstime.com/b/colorful-fishing-boat-two-antennas-orange-accents-isolated-transparent-background-png-ai-generated-362604349.jpg)
Background image: (https://static.vecteezy.com/system/resources/thumbnails/038/000/283/small/ai-generated-sunlight-illuminating-the-surface-and-depths-of-the-blue-ocean-capturing-the-essence-of-summer-with-clear-waters-and-gentle-sea-waves-photo.jpg)
Dude outline: (https://cdn.vectorstock.com/i/500p/60/59/minimalist-human-outline-vector-60366059.jpg)
Font: Coiny via Google Fonts
Dive table data: PADI Recreational Dive Planner (https://a1scubadiving.com/wp-content/uploads/2018/06/PADI-Recreational-Dive-Table-Planner.pdf)

NOTES:
This is a personal project and is not a substitute for a certified dive computer or real dive planning tools. Always follow your training and use certified equipment when diving.