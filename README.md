# Ocean Drift

A browser game i (and ai) made for arcadai hackclub ysws where you play as a sea turtle dodging plastic bags, fishing nets and sharks. Collect fish for bonus points. The longer you survive the faster it gets.

[Play it here](https://ggpogy123.github.io/Ocean-Drift/)

## Controls

- **Spacebar:** start / restart
- **Arrow Keys:** Move up and down

## Features

- 3 obstacles with different speeds, plastic bag is the fastest, fishing net is huge and slow, shark is medium
- Bonus fish that floats across randomly, collect it for +50 points
- Score goes up the longer you survive
- High score saved to localstorage so it doesnt reset when you close/refresh the tab
- Game speeds up over time
- Motion trail when you move the turtle up and down.
- Sound effects and background music, all done with Web Audio API so no audio files needed (mainly done by AI as i am still learning this)
- Ocean theme with bubbles floating up
- Start screen and game over screen

## What I used to make this

- **HTML/CSS/JS** - Vanilla, no libraries
- **Claude** - Used it for the starting prompt. Fixed a ton of bugs i couldnt figure out and did the audio stuff. 

## What changes I did after ai made first draft

- **Turtle flip** - Flipped the turtle sprite from left to right so that it actually faces where its going.
- **High score tracker** - Added a best score that shows on the HUDand on the game over screen.
- **Bonus Fish** - Added fishes that randomly float across the screen from right to left, touching it gives +50 points.
- **Motion Trail** - Added a trail to make the up and down movement look better.
- **Sound and Music** - Added sound effects and background audio.


## Challenges I had faced

- **Flipping the turtle** - Wanted it to face left since thats the direction its moving. Tried using `ctx.scale(-1,1)` but that flips the whole coordinate system, so I made all the x coordinates negative.
- **hitbox** - collision detection was broken for a while because i had used `+` instead of `*`.
- **Audio** - the background music literally sounded like a microwave the first time claude made it.
- **typo bugs** - Spent wayy too long trying to debug this when it had a simple fix. I always tend to make mistakes like this, have to be more careful while writing code.

---

## Stuff I want to add later

- Fix spawn position of trail (its a lil below turtle right now)
- More obstacle types
- Add images instead of emojis
- Pause button
- Better music
- More lives
- Fix the hitbox (sometimes hits dont reflect) 