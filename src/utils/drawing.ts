export function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b, 255];
  };

  const targetColor = hexToRgb(fillColor);
  const startPos = (startY * width + startX) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];

  if (startR === targetColor[0] && startG === targetColor[1] && startB === targetColor[2] && startA === targetColor[3]) {
    return;
  }

  const matchStartColor = (pos: number) => {
    return data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
  };

  const colorPixel = (pos: number) => {
    data[pos] = targetColor[0];
    data[pos + 1] = targetColor[1];
    data[pos + 2] = targetColor[2];
    data[pos + 3] = targetColor[3];
  };

  const pixelStack = [[startX, startY]];

  while (pixelStack.length) {
    const newPos = pixelStack.pop() as [number, number];
    let x = newPos[0];
    let y = newPos[1];

    let pixelPos = (y * width + x) * 4;

    while (y-- >= 0 && matchStartColor(pixelPos)) {
      pixelPos -= width * 4;
    }
    pixelPos += width * 4;
    ++y;

    let reachLeft = false;
    let reachRight = false;

    while (y++ < height - 1 && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < width - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      pixelPos += width * 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
