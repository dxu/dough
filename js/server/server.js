import express from 'express'
import router from './router'
const app = express()

app.use('/', router)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
