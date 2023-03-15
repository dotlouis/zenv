export default function (schema, env = process.env, options = {}) {
  try {
    return parseEnv(schema, env, options)
  } catch (e) {
    console.info('\n', `${e.message}, exiting...`, '\n')
    process.exit(1)
  }
}

export function parseEnv(schema, obj, { publicPrefix } = {}) {
  const envObj = {}
  let overallSuccess = true

  for (const [varName, varValue] of Object.entries(schema)) {
    let defaulted = false
    let masked = '***' // mask secrets by default
    let success = true

    if (varValue instanceof z.ZodType) {
      const validation = varValue.safeParse(obj[varName])
      success = validation.success

      if (publicPrefix && varName.startsWith(publicPrefix)) {
        masked = success ? validation.data : obj[varName] // expose public envs
      }

      defaulted = varValue instanceof z.ZodDefault && obj[varName] === undefined
      overallSuccess = overallSuccess && success
    }

    console.info(
      success
        ? `🟢 ${varName} = ${defaulted ? '\x1b[33m' : '\x1b[34m'}${masked}${
            defaulted
              ? ` (default) ${'\x1b[0m'}${
                  varValue.description ? `-- ${varValue.description}` : ''
                }`
              : ''
          }${'\x1b[0m'}` // available colors at https://stackoverflow.com/a/40560590/3988308
        : `🔴 ${varName} ${
            varValue.description ? `-- ${varValue.description}` : ''
          }${'\x1b[0m'}`,
    )
    envObj[varName] = obj[varName]
  }

  if (!overallSuccess) throw new Error('Missing environment variable')

  return envObj
}
