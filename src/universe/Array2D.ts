
type SliceRange = [number, number]

class Array2D<T> {

    private array: Array<Array<T>>

    constructor(array: Array<Array<T>>) {
        this.array = array
    }

    width(): number {
        return Math.min(...this.array.map(row => row.length))
    }

    height(): number {
        return this.array.length
    }

    get(x: number, y: number): T {
        return this.array[y][x]
    }

    set(x: number, y: number, value: T): T {
        if (!this.array[y]) {
            this.array[y] = []
        }
        return this.array[y][x] = value
    }

    slice([xMin, xMax]: SliceRange, [yMin, yMax]: SliceRange): Array2D<T> {
        return new Array2D(this.array.slice(yMin, yMax).map((row) => {
            return row.slice(xMin, xMax)
        }))
    }


    forEach(callback: (item: T, x: number, y: number) => void): void {
        this.array.forEach((row: T[], y: number) => {
            row.forEach((item: T, x: number) => {
                callback(item, x, y)
            })
        })
    }
}

export default Array2D