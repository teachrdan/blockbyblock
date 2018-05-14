function BlockBoard (options) {
  this.storage = {} // storage['x'] = [y1, y2]
  this.blockSize = options.blockSize // pixels
  this.linePadding = options.linePadding // pixels
  this.divider = options.divider // pixels
  this.dividerEvery = options.dividerEvery // rows or columns
  this.startingX = options.startingX
  this.parent = options.parent
  this.svgWidth = options.svgWidth
  this.svgHeight = options.svgHeight
  this.svg = d3.select(this.parent)
    .attr('width', this.svgWidth).attr('height', this.svgHeight)

}

BlockBoard.prototype.reset = function () {
  this.storage = {}
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

BlockBoard.prototype.build = function (options) {
  return this.svg.append('rect')
    .attr('id', `row${options.row}column${options.column}`)
    .attr('height', blockSize)
    .attr('width', blockSize)
    .attr('x', options.x)
    .attr('y', options.y)
    .attr('opacity', defaultOpacity)
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
  const blockCount = d3.select('block')
  console.log("blockCount", blockCount)
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
}
