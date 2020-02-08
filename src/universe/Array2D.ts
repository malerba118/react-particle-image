
type SliceRange = [number, number]

class Array2D<T> {

    private array: Array<Array<T>>
    private width: number;
    private height: number;

    constructor(array: Array<Array<T>>) {
        this.array = array
        this.updateWidth()
        this.updateHeight()
    }

    private updateWidth(): void {
        this.width = Math.min(...this.array.map(row => row.length))
    }

    private updateHeight(): void {
        this.height = this.array.length
    }

    getHeight(): number {
        return this.height
    }

    getWidth(): number {
        return this.width
    }

    get(x: number, y: number): T {
        return this.array[y][x]
    }

    set(x: number, y: number, value: T): void {
        if (!this.array[y]) {
            this.array[y] = []
        }
        this.array[y][x] = value
        this.updateWidth()
        this.updateHeight()
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