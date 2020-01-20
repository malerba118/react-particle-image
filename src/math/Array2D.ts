type SliceRange = [number, number]

class Array2D<T> {

    private array: Array<Array<T>>

    constructor(array: Array<Array<T>>) {
        this.array = array
    }

    get(x: number, y: number): T {
        return this.array[x][y]
    }

    set(x: number, y: number, value: T): T {
        return this.array[x][y] = value
    }

    slice([xMin, xMax]: SliceRange, [yMin, yMax]: SliceRange) {
        return this.array.slice(xMin, xMax).map((row) => {
            return row.slice(yMin, yMax)
        })
    }
}

export default Array2D