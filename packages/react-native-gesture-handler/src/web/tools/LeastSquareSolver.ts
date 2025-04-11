// Implementation taken from Flutter's LeastSquareSolver
// https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/gestures/lsq_solver.dart

class Vector {
  private offset: number;
  private length: number;
  private elements: number[];

  constructor(length: number) {
    this.offset = 0;
    this.length = length;
    this.elements = new Array<number>(length);
  }

  public static fromVOL(
    values: number[],
    offset: number,
    length: number
  ): Vector {
    const result = new Vector(0);

    result.offset = offset;
    result.length = length;
    result.elements = values;

    return result;
  }

  public get(index: number): number {
    return this.elements[this.offset + index];
  }

  public set(index: number, value: number): void {
    this.elements[this.offset + index] = value;
  }

  public dot(other: Vector): number {
    let result = 0;
    for (let i = 0; i < this.length; i++) {
      result += this.get(i) * other.get(i);
    }
    return result;
  }

  public norm() {
    return Math.sqrt(this.dot(this));
  }
}

class Matrix {
  private columns: number;
  private elements: number[];

  constructor(rows: number, columns: number) {
    this.columns = columns;
    this.elements = new Array<number>(rows * columns);
  }

  public get(row: number, column: number): number {
    return this.elements[row * this.columns + column];
  }

  public set(row: number, column: number, value: number): void {
    this.elements[row * this.columns + column] = value;
  }

  public getRow(row: number): Vector {
    return Vector.fromVOL(this.elements, row * this.columns, this.columns);
  }
}

// An nth degree polynomial fit to a dataset.
class PolynomialFit {
  // The polynomial coefficients of the fit.
  //
  // For each `i`, the element `coefficients[i]` is the coefficient of
  // the `i`-th power of the variable.
  public coefficients: number[];

  // Creates a polynomial fit of the given degree.
  //
  // There are n + 1 coefficients in a fit of degree n.
  constructor(degree: number) {
    this.coefficients = new Array<number>(degree + 1);
  }
}

const precisionErrorTolerance = 1e-10;

// Uses the least-squares algorithm to fit a polynomial to a set of data.
export default class LeastSquareSolver {
  // The x-coordinates of each data point.
  private x: number[];
  // The y-coordinates of each data point.
  private y: number[];
  // The weight to use for each data point.
  private w: number[];

  // Creates a least-squares solver.
  //
  // The [x], [y], and [w] arguments must not be null.
  constructor(x: number[], y: number[], w: number[]) {
    this.x = x;
    this.y = y;
    this.w = w;
  }

  // Fits a polynomial of the given degree to the data points.
  //
  // When there is not enough data to fit a curve null is returned.
  public solve(degree: number): PolynomialFit | null {
    if (degree > this.x.length) {
      // Not enough data to fit a curve.
      return null;
    }

    const result = new PolynomialFit(degree);

    // Shorthands for the purpose of notation equivalence to original C++ code.
    const m = this.x.length;
    const n = degree + 1;

    // Expand the X vector to a matrix A, pre-multiplied by the weights.
    const a = new Matrix(n, m);
    for (let h = 0; h < m; h++) {
      a.set(0, h, this.w[h]);

      for (let i = 1; i < n; i++) {
        a.set(i, h, a.get(i - 1, h) * this.x[h]);
      }
    }

    // Apply the Gram-Schmidt process to A to obtain its QR decomposition.

    // Orthonormal basis, column-major ordVectorer.
    const q = new Matrix(n, m);
    // Upper triangular matrix, row-major order.
    const r = new Matrix(n, m);

    for (let j = 0; j < n; j += 1) {
      for (let h = 0; h < m; h += 1) {
        q.set(j, h, a.get(j, h));
      }
      for (let i = 0; i < j; i += 1) {
        const dot = q.getRow(j).dot(q.getRow(i));
        for (let h = 0; h < m; h += 1) {
          q.set(j, h, q.get(j, h) - dot * q.get(i, h));
        }
      }

      const norm = q.getRow(j).norm();
      if (norm < precisionErrorTolerance) {
        // Vectors are linearly dependent or zero so no solution.
        return null;
      }

      const inverseNorm = 1.0 / norm;
      for (let h = 0; h < m; h += 1) {
        q.set(j, h, q.get(j, h) * inverseNorm);
      }
      for (let i = 0; i < n; i += 1) {
        r.set(j, i, i < j ? 0.0 : q.getRow(j).dot(a.getRow(i)));
      }
    }

    // Solve R B = Qt W Y to find B. This is easy because R is upper triangular.
    // We just work from bottom-right to top-left calculating B's coefficients.
    const wy = new Vector(m);
    for (let h = 0; h < m; h += 1) {
      wy.set(h, this.y[h] * this.w[h]);
    }
    for (let i = n - 1; i >= 0; i -= 1) {
      result.coefficients[i] = q.getRow(i).dot(wy);
      for (let j = n - 1; j > i; j -= 1) {
        result.coefficients[i] -= r.get(i, j) * result.coefficients[j];
      }
      result.coefficients[i] /= r.get(i, i);
    }

    return result;
  }
}
