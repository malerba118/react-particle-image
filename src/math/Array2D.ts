import { range } from '../utils'

type SliceRange = [number, number]

class Array2D<T> {

    private array: Array<Array<T>>

    constructor(array: Array<Array<T>>) {
        this.array = array
    }

    width(): number {
        return Math.max(...this.array.map(row => row.length))
    }

    height(): number {
        return this.array.length
    }

    get(x: number, y: number): T {
        return this.array[x][y]
    }

    set(x: number, y: number, value: T): T {
        if (!this.array[x]) {
            this.array[x] = []
        }
        return this.array[x][y] = value
    }

    slice([xMin, xMax]: SliceRange, [yMin, yMax]: SliceRange): Array2D<T> {
        return new Array2D(this.array.slice(xMin, xMax).map((row) => {
            return row.slice(yMin, yMax)
        }))
    }

    toGrid(binSize: number): Array2D<Array2D<T>> {
        const grid = new Array2D<Array2D<T>>([[]])
        const rows = Math.floor(this.height() / binSize)
        const columns = Math.floor(this.width() / binSize)
        for (const row of range(rows)) {
            for (const col of range(columns)) {
                const rowOffset = row * binSize
                const colOffset = col * binSize
                const val = this.slice([rowOffset, rowOffset + binSize], [colOffset, colOffset + binSize])
                grid.set(row, col, val)
            }
        }
        return grid
    }

    forEach(callback: (item: T, x: number, y: number) => void): void {
        this.array.forEach((row: T[], x: number) => {
            row.forEach((item: T, y: number) => {
                callback(item, x, y)
            })
        })
    }
}

export default Array2D