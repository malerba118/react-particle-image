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
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
  
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
          if (!pixels[x]) {
              pixels[x] = []
          }
          pixels[x][y] = {
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