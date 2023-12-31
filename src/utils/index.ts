export function validJsonString(string: string) {
  try {
    JSON.parse(string)
    return true
  } catch (error) {
    return false
  }
}

export function parseStringToJson(val: string) {
  if (!validJsonString(val)) return val
  else return JSON.parse(val)
}
