import { Array2D } from './universe'
import React from 'react'

export type RGBA = {
    r: number
    g: number
    b: number
    a: number
}

export function getImageData(src: string) {
    var image = new Image();
    image.crossOrigin = "Anonymous";
    let p = new Promise<Array2D<RGBA>>((resolve, reject) => {
      image.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = image.width
        canvas.height = image.height
  
        let context = canvas.getContext("2d");
        if (!context) {
            return reject(new Error('Could not get canvas context')) 
        }
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            .data;
    
        context.clearRect(0, 0, canvas.width, canvas.height);
  
        let pixels: RGBA[][] = [];
        let i = 0;
        while (i < imageData.length - 1) {
          let x = (i / 4) % canvas.width;
          let y = Math.floor(i / 4 / canvas.width);
          if (!pixels[y]) {
              pixels[y] = []
          }
          pixels[y][x] = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
            a: imageData[i + 3]
          }
          i += 4;
        }
        resolve(new Array2D(pixels));
      };
      image.onerror = reject;
    });
    image.src = src;
    return p;
  }

  export const range = (n: number) => [...Array(n).keys()]

  export const shuffle = <T>(array: Array<T>) => {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  export const groupBy = <T>(array: Array<T>, grouper: (item: T) => string): {[key: string]: T[]} => {
    return array.reduce((groups, item) => {
      const key = grouper(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {})
  }

  export const TwoPI = Math.PI * 2;

  export const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = event.target as HTMLCanvasElement;
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

export const getTouchPosition = (event: React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = event.target as HTMLCanvasElement;
  var rect = canvas.getBoundingClientRect();
  return {
      x: (event.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width,
      y: (event.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
  };
}


export class BrowserAnimator {

  callback: Function
  delay: number
  frame: number
  time: number | null
  rafId: number | null

  constructor(callback: Function, fps: number = 30) {
    this.delay = 1000 / fps                  
    this.time = null                                 
    this.frame = -1
    this.callback = callback
  }

  setFps = (fps: number) => {
    this.delay = 1000 / fps
    this.time = null
    this.frame = -1
  }

  start = () => {
    if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.loop);
    }
  }

  stop = () => {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null
        this.time = null;
        this.frame = -1;
    }
  }

  private loop = (timestamp) => {
        if (this.time === null) {
          this.time = timestamp;   
        }
        var seg = Math.floor((timestamp - (this.time as number)) / this.delay); // calc frame no.
        if (seg > this.frame) {                                // moved to next frame?
            this.frame = seg;                                  // update
            this.callback({                                    // callback function
                time: timestamp,
                frame: this.frame
            })
        }
        this.rafId = requestAnimationFrame(this.loop)
    }
}
