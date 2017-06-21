#gamedev Dough development

# Useful links
- collision detection
	- http://gamedev.stackexchange.com/questions/26501/how-does-a-collision-engine-work
	- http://www.metanetsoftware.com/dev/tutorials
	- http://www.sevenson.com.au/actionscript/sat/
	- http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
	- http://higherorderfun.com/blog/2012/05/20/the-guide-to-implementing-2d-platformers/
	- SAT
		- http://www.dyn4j.org/2010/01/sat/
		- http://www.sevenson.com.au/actionscript/sat/

- Pixijs
	- https://github.com/kittykatattack/learningPixi

- contact cache:
	- http://www.gamasutra.com/blogs/MichaelKissner/20151120/259561/Writing_a_Game_Engine_from_Scratch__Part_3_Data__Cache.php

# Notes
- Minimum spatial hash
	- initial implementation of spatial hash - doesn’t handle any overlapping
- Spatial Hash Implementation
	- Collision detection is inacurrate, but the addition and removal of items from buckets is working as a POC

- Object Destruction 0.0.3
	- To show that the spatial hash implementation works, without having to implement any sort of physical response, I want to build a demo in which collided objects will merely disappear
	- Main questions: How do I handle Object Destruction?
		- Javascript memory handling
	- Upon a simple implementation, I noticed that there were some issues:
		- If I call destroy() in the onCollide method, there would be conflicts. Solution: make the destroy() asynchronous. Chose to use .requestAnimationFrame as opposed to setTimeout(0)
			- Implementing this brought up other bugs - I was populating too many buckets from the `_getBuckets` method.
		- In the future, I need to treat the GameObject as a superclass in which onCollide() methods get overwritten. May need to implement some form of identification or tagging similar to Unity’s GameObject class
	- When implementing with the basic implementation of onCollide() being defined as just destroying itself, I realized there would be the need for `zelda` and the `hearts` to not be manually updated by the client (developer/user of engine) so as to preserve all references within some sort of “object pool”
		- the engine needs some sort of overarching object pool.
		- in Phaser, there is an overarching game
		- However, this means that the keyboard events also need to be handled within the game objects itself
		- Solution? Game object pool, or an overarching “game” object
- Overarching Game Object:
	- To start out, let’s ignore Pixi, and continue to have that separate.
		- Phaser handles all of the sprite creation on top of this
	- How do we address object creation? For example, we’ll need to handle the “update” and “requestAnimationFrame” inside the game object itself. However, we should also be able to separate out the update methods by adding it to the Gob itself. But then, how will the Game object call each of the individual gobs? Will it need a running list of all the gobs that currently exist?
		- Possible solution: an internal “updateCanvas” method, that calls the internal list of gobs to update - including the Game’s update method as well.
			- This might also necessitate “controllers” of some sort - some overarching controller object that handles complex interactions between multiple gob’s updates functions

v0.0.3
- After implementing the overarching Game class,
- when the object gets destroyed, it was getting called multiple times
- for every spatial hash add check, for each object it would check every other object. if there were multiple overlapping buckets, onCollide would get called once for each bucket that gets checked.
	- Solution? run through and collect the set of collided gobs.
		- Problem: how do you call onCollide for a gob that is in contact with multiple gobs?
	- Solution? contact cache
- Problem: currently, we are doing “addToOneBucket”, and the spatialhash is being updated one at a time. Collision detection should be done after all objects are finished being added to the spatialhash
	- Solution: separate spatial hash from collision detection. collision engine should be its own file
	- collision engine should contain spatial hash, contact cache, and should communicate with physics engine

- PROBLEM: (referenced above) How should I architecturally organize the different systems? Physics Engine, Collision Engine, Game, updates, spatial hash.
- Collision engine should take in a set of objects who’ve changed, and then add the updates to the spatial hash
	- The problem remains: You still need to run through all updates, THEN for each gob that changed, you must check if it is now colliding with any object, and then if it is, physics that shit,
		- http://matthias-mueller-fischer.ch/publications/tetraederCollision.pdf

v0.0.4
- After implementing the separation between collision engine and spatial hash, and batching the spatial hash additions separately from the collision checks, there still ends up being the issue of race conditions on the destroy methods. in this example, when two objects hit each other, both will try to call the destroy method of the other, resulting in the destroy being called twice. While race conditions won’t occur with synchronous calculations in onCollides, the asynchronous destroy method will be affected.
	- Solution: Simply have a destroy state. If it is already being destroyed, do not destroy it again
	- Solution: use a contact cache. This seems like a better approach in the long term - it prevents the need to execute multiple function calls on the same pairs of objects. The destroy state might be important in the future, but it’s unclear at this point in time, and it doesn’t prevent the duplicate function calls.


v0.0.0-rc5: add contact cache (implement the above solution. very basic, just a mapping of the gob pairs that are known to be in contact


- Problem: keypressing - How to handle keydown/keyup? Is the events hash actually useful?
	- can’t actually handle click events right now.
	- i want to do something similar to unity - there’s just helper methods to determine whether or not keys are being pressed. the game engine can just handle it
	- Keyboard module? Should be handled within the Game class itself.
	- Instead of having the event handlers be defined by the gob itself and having them be “registered” by the game class, you can just default a handler and just have the game class (or keyboard module) update keysPressed for every single gob.
- First, we need to separate the existing keyboard handlers from the game class. registerEventHandler should no longer really be needed, but perhaps can be kept for events that might be executed by external classes (not gobs)
- All of the event handler register things should now be handled by a Keyboard module

v0.0.0-rc.6
- Implemented a new keyboard module. See RC details.
- Problem: if you hold down D, and then tap on A, it will work, but if you hold down A, and then tap on D, it doesn’t work.
	- It’s a little weird, since phaser actually also does this depending on how you use it: http://phaser.io/examples/v2/input/key
	- This is because of priority of code. The check for isKeyPressed for A is above D (vice versa maybe), and so it will always have priority.
	- How does phaser handle this?
		- https://github.com/photonstorm/phaser/blob/dd39f9ab08d57fa1bacd1287ccadb03fb3151267/src/input/Keyboard.js
			- keyboard creates a key, and delegates processKeyDown to the key itself: https://github.com/photonstorm/phaser/blob/v2.4.3/src/input/Key.js
			- in the key itself, it’ll return if it’s already down from an autorepeat

- Architecture decision: Should Game hold an instance of each of these modules? Or should each of these modules be separate? For example,
	- Game currently has a reference to this.keyboard = new Keyboard()
	- However, if we truly want a publish/subscribe model, we should have Keyboard be a separate thing, and you should be able to do Keyboard.subscribeAKAOnKeyDown(<keyCode>, callback, context)
	-

- An even bigger problem... If you have a pub/sub model, where the Gob will call game.onKeyDown(<keycode>, callback), when game (or Keyboard) executes the callback, you lose the `this` context.
	- There might be no way to get around this other than creating the optional context parameter. It’s annoying, but javascript is javascript.
	- One route: go back to this decision of this.events = { <keycode>: handler .... } instead of using an explicit game.onKeyDown model. This way, the game object handles the onKeyDown binding automatically.
		- this is a little weird, because now you have to be explicit that these are dough-specific events, not just the keyboard events. Backbone does this, but it might get confusing since these are “keyboard event”s

- AFTER THINKING, THE ABOVE problem doesn’t even make sense. The keydown, keyhold, and keyup handlers should all use the context of the keydown and keyup events anyway!! it should be on the onus of the dev to do the appropriate that = this conversion. See the first implementation of the keyboard for what i mean by this.

- Decision:
	- Have the events hash in the gob
	- game will set up the key subs on gob creation with proper context
	- game will call Keyboard’s removeGob in its own removeGob
	- Keyboard will have a list of keys, each key will have its own list of subs.


- Something to think about - when we have multiple stages, should we have multiple keyboards? so one keyboard per stage? instead of the game handling the stage. Might be able to move everything we have currently in the game into the new stage obj
	- Or should it? it’s useful in HTML/js because it gives you a reference to the canvas itself... but in this case you shouldn’t be using it...
		- on second thought, we shoudl actually go with changing this to be the object itself

- In this case, should we even be using an events hash?? why not just have the dev be able to override onKeyDown, onKeyUp, and onKeyHold methods on the gob object?
	- Can’t actually do this, because if you have them as methods, how are you going to specify which key is down/up? need to have an events hash that is
		- keyCode: {keyUp: ..., keyDown }
		- keyUp: {keycode: ...}, keyDown: {keyCode: ...}
			- Let’s go with this one.

- It would be nice if we could have the cascading test cases like with switch cases... in this case, if two methods use the same handler, you repeat it, or you have to extract it into a variable.


- While implementing the new keyboard...
	- Do we really need createEventListenerHandler, registerEventListener, etc.? Right now we are using registerEventHandler() in game for the ‘click’ event, but this isn’t really a keyboard event. For keyboard events, we really only need the keydown and keyup events. Maybe we should take this out into a generic “canvas events”.

- Moved the keyboard and

- Initial new implementation of the keyboard didn’t have the Key class. Wanted to separate out the Key.
	- Both the Key and Keyboard shouldn’t contain the gob. I should just have both of them take in generic “id”’s.


v0.0.0-rc.7
- there’s a problem with immutable positions: every update tons of position updates will occur. much more expensive to created frozen objects than to just +=/-= an attribute

- basically added a bunch of helpers to Vector2

- Implement the SAT
- Blog idea - use game figures and such to explain things like projects, etc.

- Question:
> the thick green line is the sum of the projections of the box's halfwidth vectors onto the same axis.
> (a box's halfwidth vector is similar to a circle's radius, but has a direction as well as a size)
> Note that the length of the thick blue line is always twice the length of the thick green line; since the length of the thick green line is far easier to calculate than that of the thick blue line, this allows us to quickly calculate the size of the box along any axis.”
	- Why is this true??
	- https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf

- Upon implementation, realized that the position vectors need to be RELATIVE to the center! the center should be updated, and the position vectors can always just be fixed.
	- from my perspective, i think the relative vertices should just always be a thing. The center should just always be defined, in my opinion.

- Contact cache needs to be a cache of id: { id: true ... } because you can crash into two different objects at the same time

v0.0.0-rc.8
- There are lots of performance issues!
- In particular, the collision engine is really slow. Pixi is rendering just fine. It does a decent job at 1,10,1000 objects, 10000 is a lil laggy.
- Right now, the collision engine is extremely slow because we try to reinsert everything into the spatial hash each time!
- How can we ONLY update with the items that changed?
	- http://gamedev.stackexchange.com/questions/24286/is-there-a-way-to-increase-the-collision-check-efficiency-of-a-system-of-n-objec

- It’d be nice if we could check the pre-update and post-update positions, and see if anything actually changed. if it did change, add it to the next iteration, otherwise you can just skip it.
	- What if we had a pre, update, and post - update lifecycle? the Game object will handle the proper calls.

- In our collidable gobs, we’re checking too many collidable gobs, i think. We should centralize the contact cache, so that both the spatial hash and the collision engine can look at it.

iterating over javascript objects is really slow!!


http://buildnewgames.com/broad-phase-collision-detection/
- “Another options may be to reduce the amount of discarded arrays by retaining the grid structure, and actually updating entities’ positions in the structure. While this sounds great in practice, it is actually quite difficult to do in linear time. One would have to maintain a list, for each entity, of its grid locations. During the update phase, each entity would need to be removed from cells it was no longer touching, added to new cells, and also updating its list of grid locations. This adds a lot of complexity to a relatively simple idea.”

- Going with just regenerating the spatial hash each time.
	- guaranteed O(n) runtime on each update
	- with n moving objects, you’d have to run n removals and n additions, so unless you can optimize the n removals to constant time, it’ll probably be slower.
		- We were running into performance issues with splice(), which you can make constant time using replacements, but then you have to keep track of indices ,which complicated things a lot.

- performance optimizations:
	- http://web.archive.org/web/20160315110506/http://blog.getify.com/sanity-check-object-creation-performance/
	- http://mrale.ph/blog/2014/07/30/constructor-vs-objectcreate.html

v0.0.0-rc.9
- add debug mode for drawing polygon outlines
- need to specify timestep per frame (to simulate game time, not real time)
- need to implement acceleration, velocity, etc

- Idea: message bus/event bus for communicating?
-


0.0.0-rc.10
- successfully implemented momentum conservation and velocity resolution.
- - went through a bunch of implementations, tried to fake it at first, tried to use wikipedia, and finally ddid something in the paper that's linked.
- - open questions: how exactly can I implement things like bounciness, sliding, etc? everything is just bouncing.
- next steps: rube goldberg machine editor
