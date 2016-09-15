class Vector2 {
  constructor(x, y) {
    // return an immutable object
    // return Object.freeze({ x, y })
    // TODO: rethink if we need immutable objects. positions represented by vector2 = tons of vector2 objects being created
    // if we don't need immutable objects, this should just be an ES6 class
    this.x = x
    this.y = y
  }

  mag() {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }

  print() {
    console.log(`(${this.x}, ${this.y})`)
  }

  // returns a new vector orthogonal to the passed vector
  orthor() {
    return new Vector2(-this.y, this.x)
  }

  // returns a new vector orthogonal to the passed vector
  orthol() {
    return new Vector2(this.y, -this.x)
  }

}


// returns a new vector representing the difference
Vector2.sum = Vector2.add = function(left, right) {
  return new Vector2(left.x + right.x, left.y + right.y)
}

// returns a new vector representing the difference
Vector2.difference = Vector2.minus = Vector2.subtract = function(left, right) {
  return new Vector2(left.x - right.x, left.y - right.y)
}

// returns a new vector representing the difference
Vector2.dot = function(left, right) {
  return left.x * right.x + left.y * right.y;
}

// returns normalized vector
Vector2.normalize = function(vector) {
  const mag = Vector2.mag(vector)
  return new Vector2(vector.x / mag, vector.y / mag)
}


Vector2.right = new Vector2(1, 0)
Vector2.left =  new Vector2(-1, 0)
Vector2.up =    new Vector2(0, 1)
Vector2.down =  new Vector2(0, -1)

export default Vector2

