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
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    let mag = this.mag()
    this.x /= mag
    this.y /= mag
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

// multiplies scalar to each
Vector2.multiply = Vector2.mult = function(vector, scalar) {
  return new Vector2(scalar * vector.x, scalar * vector.y)
}

// returns a new vector representing the difference
Vector2.dot = function(left, right) {
  return left.x * right.x + left.y * right.y;
}

// returns a NEW normalized vector
Vector2.normalized = function(vector) {
  const mag = vector.mag()
  return new Vector2(vector.x / mag, vector.y / mag)
}

// projection of vector1 onto vector2
Vector2.projectScalar = function(vector1, axis) {
  let normalized2 = Vector2.normalized(axis)
  return Vector2.dot(vector1, normalized2)
}

Vector2.projectVector = function(vector1, axis) {
  let normalized2 = Vector2.normalized(axis)
  return Vector2.multiply(Vector2.dot(vector1, normalized2), normalized2)
}

Vector2.right = new Vector2(1, 0)
Vector2.left =  new Vector2(-1, 0)
Vector2.up =    new Vector2(0, 1)
Vector2.down =  new Vector2(0, -1)
Vector2.one =   new Vector2(1, 1)
Vector2.zero =   new Vector2(0, 0)

export default Vector2
