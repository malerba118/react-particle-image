# react-particle-image

> Render images as interactive particles

[![NPM](https://img.shields.io/npm/v/react-particle-image.svg)](https://www.npmjs.com/package/react-particle-image) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![react-particles-demo-3](https://user-images.githubusercontent.com/5760059/74112617-d6741a00-4b63-11ea-9757-81c55fe8e9b5.gif)

## Install

```bash
npm install --save react-particle-image
```

## Links

- [Demo](https://malerba118.github.io/react-particle-image-demo/) ([source](https://github.com/malerba118/react-particle-image-demo/blob/master/src/App.tsx))
- [Docs](https://malerba118.github.io/react-particle-image/interfaces/_particleimage_particleimage_.particleimageprops.html)


## Simple Usage
[codesandbox](https://codesandbox.io/s/react-particle-image-simple-ei97k)
```tsx
import * as React from "react";
import ParticleImage, { ParticleOptions } from "react-particle-image";

const particleOptions: ParticleOptions = {
  filter: ({ x, y, image }) => {
    // Get pixel
    const pixel = image.get(x, y);
    // Make a particle for this pixel if blue > 50 (range 0-255)
    return pixel.b > 50;
  },
  color: ({ x, y, image }) => "#61dafb"
};

export default function App() {
  return (
    <ParticleImage
      src={"/react-logo.png"}
      scale={0.75}
      entropy={20}
      maxParticles={4200}
      particleOptions={particleOptions}
    />
  );
}
```

## Complex Usage
 [codesandbox](https://codesandbox.io/s/react-particle-image-complex-pbzo9)
```tsx
import * as React from "react";
import useWindowSize from "@rooks/use-window-size";
import ParticleImage, {
  ParticleOptions,
  Vector,
  forces,
  ParticleForce
} from "react-particle-image";
import "./styles.css";

const particleOptions: ParticleOptions = {
  filter: ({ x, y, image }) => {
    // Get pixel
    const pixel = image.get(x, y);
    // Make a particle for this pixel if blue > 50 (range 0-255)
    return pixel.b > 50;
  },
  color: ({ x, y, image }) => "#61dafb",
  radius: () => Math.random() * 1.5 + 0.5,
  mass: () => 40,
  friction: () => 0.15,
  initialPosition: ({ canvasDimensions }) => {
    return new Vector(canvasDimensions.width / 2, canvasDimensions.height / 2);
  }
};

const motionForce = (x: number, y: number): ParticleForce => {
  return forces.disturbance(x, y, 5);
};

export default function App() {
  const { innerWidth, innerHeight } = useWindowSize();

  return (
    <ParticleImage
      src={"/react-logo.png"}
      width={Number(innerWidth)}
      height={Number(innerHeight)}
      scale={0.75}
      entropy={20}
      maxParticles={4000}
      particleOptions={particleOptions}
      mouseMoveForce={motionForce}
      touchMoveForce={motionForce}
      backgroundColor="#191D1F"
    />
  );
}
```

## Performance Tips
`ParticleImage` has a target frame rate of 30fps, but with thousands of particles updating positions and repainting 30 times per second, performance can be a problem.

If animations are choppy try:
- Reducing the number of distinct particle colors (particles of the same color will be batched while painting)
- Reducing the number of particles (less than 6000 is ideal)
- Reducing the resolution of the src image.

Here's a [codesandbox of a good boy](https://codesandbox.io/s/react-particle-image-multicolor-dp8up) to show what I mean. Note the `round` function to reduce the number of colors painted on the canvas.


MIT © [malerba118](https://github.com/malerba118)
