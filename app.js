import express from 'express'
const app = express()
const port = 3001

import routes from './routes.js'

app.use("/fotos", express.static('./fotos'))

app.use(routes)

app.get('/', (req, res) => {
  res.send('Cadastro de treinos')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})