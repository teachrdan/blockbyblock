// TODO refactor out svgWidth and svgHeight
  // TODO create a better name for blocks of blocks; "Matrices"?
const d3 = window.d3
function BlockBoard (options) {
  this.storage = {} // storage['rowX'] = [columnY1, columnY2]

  this.blockSize = options.blockSize || 9 // pixels
  this.data = options.data // obj formatted like this.storage
  this.divider = options.divider // pixels
  this.dividerEvery = options.dividerEvery // rows or columns
  this.fill = options.fill || '#FF7518'
  this.linePadding = options.linePadding // pixels
  this.opacity = options.opacity || 0.2
  this.parent = options.parent || 'body'
  this.svgHeight = options.svgHeight || 500 // pixels
  this.svgWidth = options.svgWidth || 1000 // pixels
  this.first = 'first'
  this.svg = d3.select(this.parent)
    .attr('width', this.svgWidth).attr('height', this.svgHeight)

  if (this.data !== undefined && this.first !== undefined) this.showData(this.data[this.first])
}

BlockBoard.prototype.showData = function (data) {
  Object.keys(data).forEach(column => {
    data[column].forEach(row => {
      this.build({column, row})
    })
  })
}

BlockBoard.prototype.clearBoard = function () {
  this.storage = {}
  d3.select(this.parent).selectAll('*').remove()
  return true
}

BlockBoard.prototype.calcXY = function (num) {
  let base = num * (this.blockSize + this.linePadding)
  if (this.dividerEvery === 0) return base
  return base + Math.floor(num / this.dividerEvery) * this.divider
}

BlockBoard.prototype._checkOpen = function (x, y) {
  return (!this.storage[x] || !this.storage[x].includes(parseInt(y)))
}

// returns bool
BlockBoard.prototype.add = function (options) {
  const row = options.row
  const column = options.column
  if (!this.storage[row]) this.storage[row] = []
  if (this.storage[row].includes(column)) return false
  this.storage[row].push(column)
  return true
}

BlockBoard.prototype.build = function (options) {
  const row = parseInt(options.row)
  const column = parseInt(options.column)
  this.add({row, column})
  const x = this.calcXY(row)
  const y = this.calcXY(column)

  return this.svg.append('rect')
    .attr('id', `row${row}column${column}`)
    .attr('height', this.blockSize)
    .attr('width', this.blockSize)
    .attr('x', x)
    .attr('y', y)
    .attr('opacity', this.opacity)
    .attr('fill', this.fill)
}

// returns bool
BlockBoard.prototype.remove = function (options) {
  const x = options.x
  const y = options.y
  if (this.storage[x] && !this.storage[x].includes(y)) return false
  this.storage[x] = this.storage[x].filter(yVal => (yVal !== y))
  if (this.storage[x].length === 0) delete this.storage[x]
  return true
}

BlockBoard.prototype._checkAdjacent = function (options) {
  const x = parseInt(options.x)
  const y = parseInt(options.y)
  if (this.storage[x] && this.storage[x].includes(y)) return false // returns false if block is not free
  if (this.storage[x - 1] && this.storage[x - 1][y]) return true
  if (this.storage[x + 1] && this.storage[x + 1][y]) return true
  if (this.storage[x] && this.storage[x].includes(y - 1)) return true
  if (this.storage[x] && this.storage[x].includes(y + 1)) return true
  return false
}

BlockBoard.prototype.move = function (options) {
  const x1 = parseInt(options.x1)
  const y1 = parseInt(options.y1)
  const x2 = parseInt(options.x2)
  const y2 = parseInt(options.y2)
  this.remove({x: x1, y: y1})
  this.add({row: x2, column: y2})
  return {x2, y2}
}

BlockBoard.prototype._findMinMaxValues = function () {
  let minX = Number.MAX_SAFE_INTEGER
  let minY = Number.MAX_SAFE_INTEGER
  let maxX = Number.MIN_SAFE_INTEGER
  let maxY = Number.MIN_SAFE_INTEGER
  Object.keys(this.storage).forEach((stringX) => {
    const x = parseInt(stringX)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    this.storage[x].forEach(y => {
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    })
  })
  return {minX, minY, maxX, maxY}
}

BlockBoard.prototype.getRandomAdjacentXY = function () {
  let found = false
  let randomX
  let randomY
  const minMaxValues = this._findMinMaxValues()
  // NOTE: add 1 to find an open adjacent block
  const xRange = minMaxValues.maxX - minMaxValues.minX + 1
  const yRange = minMaxValues.maxY - minMaxValues.minY + 1
  while (!found) {
    randomX = Math.round(Math.random() * xRange)
    randomY = Math.round(Math.random() * yRange)
    found = this._checkAdjacent({x: randomX, y: randomY})
  }
  return {
    x: minMaxValues.minX + randomX,
    y: minMaxValues.minY + randomY
  }
}

BlockBoard.prototype.getRandomBlock = function () {
  let found = false
  let x
  let y
  let columnHeight = 0
  const storageWidth = Object.keys(this.storage).length
  let counter = 0 // counter to avoid endless loops
  while (!found && counter < 10000) {
    x = Math.floor(Math.random() * storageWidth)
    columnHeight = this.storage[x].length
    y = Math.floor(Math.random() * columnHeight)
    found = (x !== undefined && y !== undefined)
    counter++
  }
  if (counter === 10000) throw new Error('Too many failed attempts to get random block')
  return {x, y}
}

BlockBoard.prototype.buildBlock = function (options) {
  const row = parseInt(options.row)
  const column = parseInt(options.column)
  const x = this.calcXY(row)
  const y = this.calcXY(column)

  return this.svg.append('rect')
    .attr('class', 'block')
    .attr('id', `row${row}column${column}`)
    .attr('height', this.blockSize)
    .attr('width', this.blockSize)
    .attr('x', x)
    .attr('y', y)
    .attr('opacity', this.opacity)
    .attr('fill', this.fill)
}

BlockBoard.prototype.moveRandomBlockRandomly = function (options) {
  const coordinates = this.getRandomBlock()
  const randomAdjacentCoordinates = this.getRandomAdjacentXY()
  this.remove({x: coordinates.x, y: coordinates.y})
  this.add({row: randomAdjacentCoordinates.x, column: randomAdjacentCoordinates.y})
  // const block = d3.select(`#row${coordinates.x}column${coordinates.y}`)
  d3.select(`#row${coordinates.x}column${coordinates.y}`)
    .attr('id', `row${randomAdjacentCoordinates.x}column${randomAdjacentCoordinates.y}`)
    .attr('opacity', 0.5)
    .transition()
      .duration(500)
      .attr('x', this.calcXY(randomAdjacentCoordinates.x))
      .attr('y', this.calcXY(randomAdjacentCoordinates.y))
}
