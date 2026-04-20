function capitalizeFirstLetter(str: string) {
  if (!str) {
    return ''
  }

  return str.charAt(0).toUpperCase() + str.slice(1)
}

function convertFromCamelCase(str: string) {
  if (!str) {
    return ''
  }

  return str.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function convertFromSnakeCase(str: string) {
  if (!str) {
    return ''
  }

  return str.replace(/_/g, ' ')
}

function convertFromKebabCase(str: string) {
  if (!str) {
    return ''
  }

  return str.replace(/-/g, ' ')
}

export { capitalizeFirstLetter, convertFromCamelCase, convertFromSnakeCase, convertFromKebabCase }
