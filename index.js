const express = require('express')
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')

const db = require('./jeddit-fake-db-pass');
// const usersRouter = require('./usersRouter.js')
// const subsRouter = require('./subsRouter.js')
// const articlesRouter = require('./articlesRouter.js')
// const commentsRouter = require('./commentsRouter.js')

const app = express()
const port = 3000

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieSession({
  name: 'session',
  keys: ['put_a_key_here_i_guess'],
}))



app.set('view engine', 'ejs')


// I personally made two custom middlewares here.  You might want to, if it helps you.



// app.use('/subs', subsRouter)
// app.use('/articles', articlesRouter)
// app.use('/comments', commentsRouter)
// app.use('/users', usersRouter)



app.get('/', (req, res) => {
  res.send("Hello, World")
  // res.redirect('/subs/list')
})

app.get('/debugpage', (req, res) => {
  res.render('debugpage');
})

app.get('/debug_db', (req, res) => {
  db.debug.log_debug();
  res.send("check the server console.   <a href='/'>To Home</a>")
})

app.post('/reset_db', (req, res) => {
  db.debug.reset_and_seed();
  db.debug.log_debug();
  res.send("database reset; check the server console.   <a href='/'>To Home</a>")
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
