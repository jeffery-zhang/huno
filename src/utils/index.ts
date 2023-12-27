export function validJsonString(string: string) {
  try {
    JSON.parse(string)
    return true
  } catch (error) {
    return false
  }
}

export function parseStringToJsonString(string: string) {
  return '"' + string + '"'
}
