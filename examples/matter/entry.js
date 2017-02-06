document.addEventListener('DOMContentLoaded', function(){

  var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies;
  const engine = Matter.Engine.create();
  var boxA = Bodies.rectangle(400, 200, 80, 80, {
    velocity: {
      x: 12,
      y: 10,
    }
  });
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  World.add(engine.world, [boxA, boxB, ground]);

  // run the engine
  Engine.run(engine);
  Engine.update(engine);


});
