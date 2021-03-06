
function trimExtraChar(value, _char, regExp) {
  var index = value.indexOf(_char)

  if (index === -1) {
    return value
  }

  if (_char === '-' && index !== 0) {
    return value.slice(0, index)
  }

  return value.slice(0, index + 1) + value.slice(index).replace(regExp, '')
}

export function formatNumber(value, allowDot, max, min) {
  if (allowDot) {
    value = trimExtraChar(value, '.', /\./g)
  } else {
    value = value.split('.')[0]
  }

  value = trimExtraChar(value, '-', /-/g)
  var regExp = allowDot ? /[^-0-9.]/g : /[^-0-9]/g
  value = value.replace(regExp, '')
  if (typeof max === 'number' && value > max) {
    value = max
  }
  if (typeof min === 'number' && value < min) {
    value = min
  }
  return value
}
