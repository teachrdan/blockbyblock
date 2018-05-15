// TODO add feature to create passed in data?
function BlockBoard (options) {
  this.storage = {} // storage['rowX'] = [columnY1, columnY2]

  this.blockSize = options.blockSize || 9 // pixels
  this.divider = options.divider || 20 // pixels
  this.dividerEvery = options.dividerEvery || 10 // rows or columns
  this.linePadding = options.linePadding || 1 // pixels
  this.opacity = options.opacity || 0.2
  this.parent = options.parent || 'body'
  this.startingX = options.startingX || 0
  this.svgHeight = options.svgHeight || 500 // pixels
  this.svgWidth = options.svgWidth || 1000 // pixels

  this.svg = d3.select(this.parent)
    .attr('width', this.svgWidth).attr('height', this.svgHeight)
}

BlockBoard.prototype.clearBoard = function () {
  this.storage = {}
  d3.select(this.parent).selectAll('*').remove()
}

BlockBoard.prototype.calcXY = function (num) {
  let baseX = this.startingX + num * (this.blockSize + this.linePadding)
  return baseX + Math.floor(num / this.dividerEvery) * this.divider
}
BlockBoard.prototype._checkOpen = function (x ,y) {
  return (!this.storage[x] || !this.storage[x].includes(parseInt(y))) ? true : false
}

BlockBoard.prototype.add = function (options) {
  const x = parseInt(options.x)
  const y = parseInt(options.y)
  if (!this.storage[x]) this.storage[x] = []
  this.storage[x].push(y)
  return {x, y}
}

// TODO fix this
BlockBoard.prototype.build = function (options) {
  this.add({x: options.row, y: options.column})
  return this.svg.append('rect')
    .attr('id', `row${options.row}column${options.column}`)
    .attr('height', this.blockSize)
    .attr('width', this.blockSize)
    .attr('x', options.x)
    .attr('y', options.y)
    .attr('opacity', this.opacity)
    .attr('fill', '#FF7518')
}

BlockBoard.prototype.remove = function (options) {
  const x = parseInt(options.x)
  const y = parseInt(options.y)
  this.storage[x] = this.storage[x].filter(yVal => (yVal !== y))
  if (this.storage[x].length === 0) delete this.storage[x]
  return true
}

BlockBoard.prototype._checkAdjacent = function (options) {
  const x = parseInt(options.x)
  const y = parseInt(options.y)
  if (this.storage[x] && this.storage[x].includes(y)) return false // returns false if block is not free
  if (this.storage[x-1] && this.storage[x-1][y]) return true
  if (this.storage[x+1] && this.storage[x+1][y]) return true
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
  this.add({x: x2, y: y2})
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
  let randomX = undefined
  let randomY = undefined
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

// TODO improve this "random" algo
  // TODO count all blocks and choose one
BlockBoard.prototype.getRandomBlock = function () {
  let found = false
  let x = undefined
  let y = undefined
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
// TODO finish this
  // builds passed in data or this.storage
BlockBoard.prototype.buildBlock = function () {
  return svg.append('rect')
    .attr('class', 'block')
    .attr('id', `row${options.row}column${options.column}`)
    .attr('height', blockSize)
    .attr('width', blockSize)
    .attr('x', options.x)
    .attr('y', options.y)
    .attr('opacity', defaultOpacity)
    .attr('fill', '#FF7518')
}

BlockBoard.prototype.moveRandomBlockRandomly = function (options) {
  const delay = d3.scaleLinear()
    .domain([0, options.max])
    .range([1000, 1500]) // TODO make these variables
  const coordinates = this.getRandomBlock()
  const randomAdjacentCoordinates = this.getRandomAdjacentXY()
  this.remove({x: coordinates.x, y: coordinates.y})
  this.add({x: randomAdjacentCoordinates.x, y: randomAdjacentCoordinates.y})
  const block = d3.select(`#row${coordinates.x}column${coordinates.y}`)
  // console.log("block.attr('opacity')", block.attr('opacity'))
  d3.select(`#row${coordinates.x}column${coordinates.y}`)
    .attr('id', `row${randomAdjacentCoordinates.x}column${randomAdjacentCoordinates.y}`)
    .attr('opacity', 0.5)
    .transition()
      .duration(500)
      .attr('x', this.calcXY(randomAdjacentCoordinates.x))
      .attr('y', this.calcXY(randomAdjacentCoordinates.y))
}
