TODO's:
- explore support for custom gob position
  - allow gobs to be marked as following velocity/acceleration updates or not?
- Remove all example dependencies
  - The examples shouldn't have dependencies. Shouldn't need express (or even node), babel, even webpack.
    - See react examples for ideal setup
- Look into swept AABB
  - Supposedly better performance with rectangles, look into whether it supports Polygons, see if we can fallback to SAT for polygons
- verlet integration
  - i don't understand why we need it, if we do

- Checklist until v0.0.1 #8
  - Collision resolution
  - Basic Physics - gravity, acceleration, force, friction, angular velocity, time
  - Camera - render view,
  - Stages - switching between game states
  - Intermediate loading states
  - Data store?
  - DOM integration/communication

- Investigate converting V2 into object literal creation #7
  - Investigate whether or not we can make the class instantiation model for the V2 class into object literals while still taking advantage of hidden class optimizations via Object.assign.

- Separate sprite into new class #6
  - Current thought process:
  - Gobs should be able to have (or not have) sprites, and should be able to have (or not have) physics bodies.
  - Sprites will have their own customizable sizes independent of gobs/physics bodies.
  - Polygons should reside on gobs.
  - Q: Why does Phaser distinguish between Image and Sprite? Just because of the animation abilities?

-What events are useful and should be tracked by pew?
  - canvas events
  - gob specific events?
  - implementation? would have to implement position checks
  - mouse events
