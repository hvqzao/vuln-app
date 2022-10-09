import { DataSource } from 'typeorm'
import Express from 'express'
import { User } from './models'

import type { Request, Response } from 'express'

const index = () => async (req: Request, res: Response) => {
  res.send(
    `
<html>
  <body>
    <ul>
      <li><a href="/one">1</a></li>
      <li><a href="/two">2</a></li>
      <li><a href="/three">3</a></li>
    </ul>
  </body>
</html>
      `.trim()
  )
}

const one = () => async (req: Request, res: Response) => {
  res.send(
    `
<html>
  <body>
    <a href="/">back</a>
    <form action="/one" method="POST">
      <input type="text" name="hello" value="${
        req.body?.hello || ''
      }" autofocus />
    </form>
  </body>
</html>
      `.trim()
  )
}

const two = () => async (req: Request, res: Response) => {
  res.send(
    `
<html>
  <head>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        var hello='${req.body?.hello || ''}';
        document.querySelector('[name=hello]').setAttribute('value', hello);
      });
    </script>
  </head>
  <body>
    <a href="/">back</a>
    <form action="/two" method="POST">
      <input type="text" name="hello"autofocus />
    </form>
  </body>
</html>
      `.trim()
  )
}

const three = (orm: DataSource) => async (req: Request, res: Response) => {
  try {
    const results = await orm.manager.query(
      `select username from users where username like '%${
        req.body?.hello || ''
      }%';`
    )
    res.send(
      `
<html>
  <body>
    <a href="/">back</a>
    <form action="/three" method="POST">
      <input type="text" name="hello" value="${(req.body?.hello || '').replace(
        /"/g,
        "'"
      )}" autofocus />
    </form>${
      results.length > 0
        ? '\n    <ul>\n' +
          results
            .map(
              (result: { username: string }) =>
                `      <li>${result.username}</li>`
            )
            .join('\n') +
          '\n    </ul>'
        : ''
    }
  </body>
</html>
      `.trim()
    )
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
}

const addUser = async (orm: DataSource, username: string, password: string) => {
  const user = new User()
  user.username = username
  user.password = password
  await orm.manager.save(user)
}

const app = async (): Promise<void> => {
  const orm = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [User],
    synchronize: true,
    logging: false
  })
  await orm.initialize()
  await addUser(orm, 'admin', 'Password1')
  await addUser(orm, 'user', 'Password2')
  const express = Express()
  express.use(Express.urlencoded({ extended: true }))
  express.all('*', async (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`)
    next()
  })
  express.get('/', index())
  express.all('/one', one())
  express.all('/two', two())
  express.all('/three', three(orm))
  express.all('*', async (req, res) => {
    res.status(404).send('Page Not Found')
  })
  express.listen(3000, '0.0.0.0', async () => {
    console.log(`Ready.`)
  })
}

app()
