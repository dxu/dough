// should always be immutable, make a factory object
const Vector2 = {
  create(x, y) {
    // return an immutable object
    return Object.freeze({ x, y })
  },

  toString(vector) {
    return `(${vector.x}, ${vector.y})`
  },

  print(vector) {
    console.log(`(${vector.x}, ${vector.y})`)
  }

}


// returns a new vector representing the difference
Vector2.sum = Vector2.add = function(left, right) {
  return Vector2.create(left.x + right.x, left.y + right.y)
}

// returns a new vector representing the difference
Vector2.difference = Vector2.minus = Vector2.subtract = function(left, right) {
  return Vector2.create(left.x - right.x, left.y - right.y)
}

// returns a new vector representing the difference
Vector2.dot = function(left, right) {
  return left.x * right.x + left.y * right.y;
}

Vector2.right = Vector2.create(1, 0)
Vector2.left =  Vector2.create(-1, 0)
Vector2.up =    Vector2.create(0, 1)
Vector2.down =  Vector2.create(0, -1)

export default Vector2
