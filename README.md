# Ocean Drift

A browser game i (and ai) made for arcadai hackclub ysws where you play as a sea turtle dodging plastic bags, fishing nets and sharks. Collect fish for bonus points. The longer you survive the faster it gets.

[Play it here](https://your-link-here)

## Controls

- **Spacebar:** start / restart
- **Arrow Keys:** Move up and down

## Features

- 3 obstacles with different speeds, plastic bag is the fastest, fishing net is huge and slow, shark is medium
- Bonus fish that floats across randomly, collect it for +50 points
- Score goes up the longer you survive
- High score saved to localstorage so it doesnt reset when you close/refresh the tab
- Game speeds up over time
- Motion trail behind the turtle that gets stronger as speed increases
- Sound effects and background music, all done with Web Audio API so no audio files needed (mainly done by AI as i am still learning this)
- Ocean theme with bubbles floating up
- Start screen and game over screen

## What i used to build this

- **HTML/CSS/JS** - Vanilla, no libraries
- **Claude** - Used it for the starting prompt. Fixed a ton of bugs i couldnt figure out and did the audio stuff. 

## Challenges i had

- **Flipping the turtle** - Wanted it to face left since thats the direction its moving. used `ctx.scale(-1,1)` but that flips the whole coordinate system so all the x coordinates had to be made negative.
- **Trail** -Kept going vertically instead of horizontally, eventually figured out it was the coordinates being wrong after the scale flip.
- **hitbox** - collision detection was broken for a while because i had used `+` instead of `*`.
- **Audio** - the background music literally sounded like a microwave the first time claude made it.
- **typo bugs** - general issues.

---

## stuff i want to add later

- smoother trail
- more obstacle types
- touch controls for mobile
- pause button
- better music