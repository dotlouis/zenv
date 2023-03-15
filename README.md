# zenv

Parse and validate environment variables using [zod](https://zod.dev/)

## Installation

```bash
npm install -D zod @dotlouis/zenv
```

_Note: `zod` package is required as a peer dependency._

## Usage

```javascript
import { z } from 'zod'
import { zenv } from '@dotlouis/zenv'

const env = zenv(
  {
    DATABASE_URL: z.string().url(), // use zod type validators as  you would normaly
    DATABSE_SECERT: z
      .string()
      .describe('Get your secret at https://mydatabase.com/tokens'), // Add a description that will be displayed if the variable is missing or defaulted
    NEXT_PUBLIC_PORT: z.string().optional(),
    NEXT_PUBLIC_HOSTNAME: z.string().default('localhost'),
  },
  process.env, // optional, the variable to parse the schema against. By default zenv will scan process.env
  {
    // optional options
    publicPrefix: 'NEXT_PUBLIC_', // by default zenv mask all enviroment variable. Specify a prefix to display the variables (DON'T USE IT FOR SENSITIVE VARIABLES such as secrets)
  },
)
```
