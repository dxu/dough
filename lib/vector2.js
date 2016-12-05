/* @flow */

class Vector2 {
  x: number;
  y: number;

  static Right: Vector2;
  static Left: Vector2;
  static Up: Vector2;
  static Down: Vector2;
  static One: Vector2;
  static Zero: Vector2;

  /* TODO: can i just inline the static functions? */
  static Sum: Function;
  static Difference: Function;
  static ScalarProduct: Function;
  static Dot: Function;
  static Normalized: Function;
  static ProjectScalar: Function;
  static ProjectVector: Function;
  static Negative: Function;

  constructor(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  add(x: number = 0, y: number = 0): Vector2 {
    this.x += x;
    this.y += y;
    return this;
  }

  subtract(x: number = 0, y: number = 0): Vector2 {
    this.x += x;
    this.y += y;
    return this;
  }

  multiply(x: number = 1, y: number = 1): Vector2 {
    this.x *= x;
    this.y *= y;
    return this;
  }

  divide(x: number = 1, y: number = 1): Vector2 {
    this.x /= x;
    this.y /= y;
    return this;
  }

  isZero(): bool {
    return this.x === 0 && this.y === 0;
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dot(vector: Vector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  normalize(): Vector2 {
    const mag: number = this.mag();
    this.x /= mag;
    this.y /= mag;
    return this;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  print(): void {
    // eslint-disable-next-line no-console
    console.log(`(${this.x}, ${this.y})`);
  }

  // returns a new vector orthogonal to this vector
  orthor(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  // returns a new vector orthogonal to this vector
  orthol(): Vector2 {
    return new Vector2(this.y, -this.x);
  }

  // return a clone of this vector
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

// returns a new vector representing the sum
Vector2.Sum = function(left: Vector2, right: Vector2): Vector2 {
  return new Vector2(left.x + right.x, left.y + right.y);
};

// returns a new vector representing the difference
Vector2.Difference = function(left: Vector2, right: Vector2): Vector2 {
  return new Vector2(left.x - right.x, left.y - right.y);
};

// multiplies scalar to each
Vector2.ScalarProduct = function(vector: Vector2, scalar: number): Vector2 {
  return new Vector2(scalar * vector.x, scalar * vector.y);
};
// returns a new vector representing the difference
Vector2.Dot = function(left: Vector2, right: Vector2): number {
  return left.x * right.x + left.y * right.y;
};
// returns a NEW normalized vector
Vector2.Normalized = function(vector: Vector2): Vector2 {
  const mag: number = vector.mag();
  return new Vector2(vector.x / mag, vector.y / mag);
};

// projection of vector1 onto vector2
Vector2.ProjectScalar = function(vector1: Vector2, axis: Vector2): number {
  const mag: number = axis.mag();
  return vector1.x * axis.x / mag + vector1.y * axis.y / mag;
  // let normalized2 = Vector2.Normalized(axis)
  // return Vector2.Dot(vector1, normalized2)
};

Vector2.ProjectVector = function(vector1: Vector2, axis: Vector2): Vector2 {
  const scalarProject: number = Vector2.ProjectScalar(vector1, axis);
  const normed: Vector2 = Vector2.Normalized(axis);
  return normed.multiply(scalarProject, scalarProject);
};

Vector2.Negative = function(vector: Vector2): Vector2 {
  return new Vector2(-vector.x, -vector.y);
};

Vector2.Right = new Vector2(1, 0);
Vector2.Left = new Vector2(-1, 0);
Vector2.Up = new Vector2(0, 1);
Vector2.Down = new Vector2(0, -1);
Vector2.One = new Vector2(1, 1);
Vector2.Zero = new Vector2(0, 0);

export default Vector2;
