# 0.0.0
## rc.10
- Flowify Gob, Pool, Vector2
- Restructure examples
- Implement predictive SAT collision algorithm, add friction and bounciness.

## rc.9

- Convert most things to Vector2's
- Stop creating so many new Vector2()'s on critical path
- optimize SAT - mostly Vector2 creations.
- optimize Spatial hash by simply regenerating entire spatial hash. on a spatial hash with >moving objects compared to non-moving objects, this is probably more performant since you don't have to do removals. Guaranteed O(n) insertions and 0 removals on each iteration
- currently on my macbook can support roughly 1500 gobs on screen at ~30fps. Performance decreases as spatial hash clumping increases due to similarity to brute force.
- don't even know how else i can optimize this significantly without changing the algorithm. even removing the SAT calls, we're limited by possibly N^2 checks. executing an empty function was causing a slowdown

## rc.8

- SAT collision detection
- AABB for all gobs
- doesn't handle circles
- didn't test polygon handling
- changes contact cache structure
- changes position/width/height/vertices
- Adds Vector2 class with associated functionality

## rc.7

- Separate out Keyboard into individual Keys.
- Game delegates to Keyboard, Keyboard delegates to Key
- Event-based keyboard events using an event hash in the gob. Maintains the isPressed functionality but follows Phaser's idea of having separate onKeyHold, onKeyDown, onKeyUp event listeners.

## rc.6
- Separates the key handling into a separate module instantiated/managed by Game
- Keyboard has no knowledge of gobs, gobs have no knowledge of keyboard.
  - gobs are given a isKeyDown function.
- Problems: key-handling priority. Should be done with events, as opposed to the current checks?

## rc.5
- Basic contact cache implementation
- prevents duplicate collision calls from occurring

## rc.4

- Fix gob destruction
- separate collision engine from spatial hash and game
- fix collision detection

## rc.3

- Overarching Game Class to handle game creation
  - gob creation
  - render calls
  - memory management
  - gob destruction
- Move updates to Gob Class
- update examples to new API

## rc.2

Spatial hash addition/removal POC. Collision detection is inaccurate. No physics response implemented. No object destruction implemented.

## rc.1

Initial implementation of a spatial hash. Minimal implementation that doesn't actually handle tile overlap.
