import { Array2D } from './math'

export type RGBA = {
    r: number
    g: number
    b: number
    a: number
}

export function getImageData(src: string, scale: number = 1) {
    var image = new Image();
    image.crossOrigin = "Anonymous";
    let p = new Promise<Array2D<RGBA>>((resolve, reject) => {
      image.onload = function() {
        let canvas = document.createElement("canvas");
        const scaledWidth = Math.floor(image.width * scale);
        const scaledHeight = Math.floor(image.height * scale);
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        console.log(image.width, image.height)

  
        let context = canvas.getContext("2d");
        if (!context) {
            throw new Error('Could not get canvas context')  
        }
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, scaledWidth, scaledHeight);
  
        let imageData = context.getImageData(0, 0, scaledWidth, scaledHeight)
            .data;
    
        context.clearRect(0, 0, canvas.width, canvas.height);
  
        let pixels: RGBA[][] = [];
        let i = 0;
        while (i < imageData.length - 1) {
          let x = (i / 4) % scaledWidth;
          let y = Math.floor(i / 4 / scaledWidth);
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
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
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