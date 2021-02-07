const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const screenOptions = {
  w: 300,
  h: 400,
  color: "black"
};

canvas.width = screenOptions.w;
canvas.height = screenOptions.h;

const drawPolygon = polygonInst => {
  const { points } = polygonInst;
  const [oX, oY] = points[0];

  ctx.beginPath();

  let x, y;

  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(oX, oY);

  ctx.stroke();
};

const observe = (obj, key) => {
  let val = obj[key];

  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(newVal) {
      const { points } = obj;
      points.forEach((point, index) => {
        points[index][key === "x" ? 0 : 1] += newVal - val;
      });
      val = newVal;
    }
  });
};

const PI = Math.PI;
const endAngle = 2 * PI;

const toRad = val => {
  return val * (PI / 180);
};
const toDeg = val => {
  return val * (180 / PI);
};

const drawCircle = (x, y, r) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, endAngle);
  ctx.stroke();
};

class Polygon {
  constructor(points) {
    this.x = points[0][0];
    this.y = points[0][1];
    this.points = points;
    observe(this, "x");
    observe(this, "y");

    this.anchor = [150, 150];
    this.distances = [];
    this.degrees = [];

    this.points.forEach(point => {
      let [ax, ay] = this.anchor;
      let [px, py] = point;
      if (px === ax) {
        px += 1;
      }
      if (py === ay) {
        py += 1;
      }
      let dy = Math.abs(py - ay);
      let dx = Math.abs(px - ax);

      let distance = Math.sqrt(dy * dy + dx * dx);

      this.distances.push(Number(distance.toFixed(0)));

      switch (true) {
        case px > ax && py < ay:
          this.degrees.push(Number(toDeg(Math.asin(dx / distance)).toFixed(0)));
          break;

        case px > ax && py > ay:
          this.degrees.push(
            Number((toDeg(Math.asin(dy / distance)) + 90).toFixed(0))
          );
          break;

        case px < ax && py > ay:
          this.degrees.push(
            Number((toDeg(Math.asin(dx / distance)) + 180).toFixed(0))
          );
          break;

        case px < ax && py < ay:
          this.degrees.push(
            Number((toDeg(Math.asin(dy / distance)) + 270).toFixed(0))
          );
          break;

        default:
          return;
      }
    });
  }
  rotate(deg) {
    this.points = this.points.map((point, index) => {
      const [ax, ay] = this.anchor;
      const distance = this.distances[index];
      let newDegree = (this.degrees[index] + deg) % 360;
      if (newDegree < 0) {
        newDegree = 360 - Math.abs(newDegree);
      }
      if (!(newDegree % 90)) {
        newDegree += 1;
      }
      let x, y, angle;

      switch (true) {
        case newDegree > 0 && newDegree < 90:
          x = ax + distance * Math.sin(toRad(newDegree));
          y = ay - distance * Math.cos(toRad(newDegree));
          return [x, y];

        case newDegree > 90 && newDegree < 180:
          angle = newDegree - 90;
          x = ax + distance * Math.cos(toRad(angle));
          y = ay + distance * Math.sin(toRad(angle));
          return [x, y];

        case newDegree > 180 && newDegree < 270:
          angle = newDegree - 180;
          x = ax - distance * Math.sin(toRad(angle));
          y = ay + distance * Math.cos(toRad(angle));
          return [x, y];

        case newDegree > 270 && newDegree < 360:
          angle = newDegree - 270;
          x = ax - distance * Math.cos(toRad(angle));
          y = ay - distance * Math.sin(toRad(angle));
          return [x, y];

        default:
          // console.log((this.degrees[index] + deg) % 360);
          return;
      }
    });
  }
  drawPolygon() {
    drawPolygon(this);
  }
}
let angle = 100;
const poly1 = new Polygon([
  [50, 100],
  [65, 143],
  [80, 140],
  [200, 55]
]);

const poly2 = new Polygon([
  [50, 180],
  [75, 203],
  [160, 200],
  [200, 95]
]);

// poly1.rotate(-278);

const render = () => {
  const { w, h, color } = screenOptions;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "yellow";
  drawCircle(poly1.anchor[0], poly1.anchor[1], 5);

  poly1.rotate(angle--);
  poly2.rotate(angle--);

  poly1.drawPolygon();
  poly2.drawPolygon();
  // poly1.anchor[0] += 0.1;
  // poly1.anchor[1] += 0.1;

  requestAnimationFrame(render);
};

render();
