
class Vector {

    x: number;
    y: number;

    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  
    add(vector: Vector): Vector {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    }
  
    subtract(vector: Vector): Vector {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
    }
  
    addScalar(scalar: number): Vector {
      this.x += scalar;
      this.y += scalar;
      return this;
    }
  
    divideScalar(scalar: number): Vector {
      this.x = this.x / scalar;
      this.y = this.y / scalar;
      return this;
    }
  
    multiplyScalar(scalar: number): Vector {
      this.x = this.x * scalar;
      this.y = this.y * scalar;
      return this;
    }
  
    getMagnitude(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  
    getAngle(): number {
      return Math.atan2(this.y, this.x);
    }

    clone(): Vector {
      return new Vector(this.x, this.y)
    } 

    toUnit(): Vector {
      const magnitude = this.getMagnitude() 
      if (magnitude) {
        return this.clone().divideScalar(magnitude)
      }
      return this.clone()
    } 
  
    static from(angle: number, magnitude: number): Vector {
      return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
  
    static sum(vectors: Vector[]): Vector {
      let v = new Vector(0, 0);
      vectors.forEach(vector => {
        v.add(vector);
      });
      return v;
    }
  }

  export default Vector;