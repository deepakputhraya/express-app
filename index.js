const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/ping', (req, res) => {
    res.send({
        message : "pong!"
    })
})

app.get('/headers', (req, res) => {
    res.send({
        headers : req.headers
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
