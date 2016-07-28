import express from 'express'
import router from './router'
const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use('/js', express.static('dist'));

app.use('/', router)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
