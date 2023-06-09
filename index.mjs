import { ZodType, ZodDefault, ZodOptional } from 'zod'

export default function (schema, env = process.env, options = {}) {
  try {
    return parseEnv(schema, env, options)
  } catch (e) {
    console.info('\n', `${e.message}, exiting...`, '\n')
    process.exit(1)
  }
}

export function parseEnv(schema, obj, { publicPrefix, display = true } = {}) {
  const envObj = {}
  let overallSuccess = true

  for (const [varName, varValue] of Object.entries(schema)) {
    let defaulted = false
    let masked = '***' // mask secrets by default
    let success = true
    let optional = false

    if (varValue instanceof ZodType) {
      const validation = varValue.safeParse(obj[varName])
      success = validation.success

      if (publicPrefix && varName.startsWith(publicPrefix)) {
        masked = success ? validation.data : obj[varName] // expose public envs
      }

      defaulted = varValue instanceof ZodDefault && obj[varName] === undefined
      overallSuccess = overallSuccess && success

      optional = varValue instanceof ZodOptional

      if (success) {
        envObj[varName] = validation.data
      }
    } else {
      envObj[varName] = varValue
    }

    if (display) {
      const description = varValue.description
        ? `-- ${varValue.description}`
        : ''
      const optionalUnset = optional && obj[varName] === undefined
      console.info(
        success
          ? `${optional ? (optionalUnset ? '⚪' : '🔘') : '🟢'} ${varName} ${
              optional ? '(optional)' : ''
            } ${
              optionalUnset
                ? description
                : `= ${defaulted ? '\x1b[33m' : '\x1b[34m'}${masked}${
                    defaulted ? ` (default) ${'\x1b[0m'}${description}` : ''
                  }${'\x1b[0m'}`
            }` // available colors at https://stackoverflow.com/a/40560590/3988308
          : `🔴 ${varName} ${description}${'\x1b[0m'}`,
      )
    }
  }

  if (!overallSuccess) throw new Error('Missing environment variable')

  return envObj
}
