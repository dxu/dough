class Vector2 {
  constructor(x, y) {
    // return an immutable object
    // return Object.freeze({ x, y })
    // TODO: rethink if we need immutable objects. positions represented by vector2 = tons of vector2 objects being created
    // if we don't need immutable objects, this should just be an ES6 class
    this.x = x
    this.y = y
  }

  add(x=0, y=0) {
    this.x += x
    this.y += y
  }

  subtract(x=0, y=0) {
    this.x += x
    this.y += y
  }

  multiply(x=1, y=1) {
    this.x *= x
    this.y *= y
  }

  divide(x=1, y=1) {
    this.x /= x
    this.y /= y
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
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

  // returns a new vector orthogonal to this vector
  orthor() {
    return new Vector2(-this.y, this.x)
  }

  // returns a new vector orthogonal to this vector
  orthol() {
    return new Vector2(this.y, -this.x)
  }

}


// returns a new vector representing the difference
Vector2.Sum = Vector2.Add = function(left, right) {
  return new Vector2(left.x + right.x, left.y + right.y)
}

// returns a new vector representing the difference
Vector2.Difference = Vector2.Minus = Vector2.Subtract = function(left, right) {
  return new Vector2(left.x - right.x, left.y - right.y)
}

// multiplies scalar to each
Vector2.Multiply = Vector2.Mult = function(vector, scalar) {
  return new Vector2(scalar * vector.x, scalar * vector.y)
}

// returns a new vector representing the difference
Vector2.Dot = function(left, right) {
  return left.x * right.x + left.y * right.y;
}

// returns a NEW normalized vector
Vector2.Normalized = function(vector) {
  const mag = vector.mag()
  return new Vector2(vector.x / mag, vector.y / mag)
}

// projection of vector1 onto vector2
Vector2.ProjectScalar = function(vector1, axis) {
  let mag = axis.mag()
  return vector1.x * axis.x / mag + vector1.y * axis.y / mag
  // let normalized2 = Vector2.Normalized(axis)
  // return Vector2.Dot(vector1, normalized2)
}

Vector2.ProjectVector = function(vector1, axis) {
  let normalized2 = Vector2.normalized(axis)
  return Vector2.multiply(Vector2.dot(vector1, normalized2), normalized2)
}


Vector2.Right = new Vector2(1, 0)
Vector2.Left =  new Vector2(-1, 0)
Vector2.Up =    new Vector2(0, 1)
Vector2.Down =  new Vector2(0, -1)
Vector2.One =   new Vector2(1, 1)
Vector2.Zero =   new Vector2(0, 0)

export default Vector2
