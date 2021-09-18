const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');
const e = require('express');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
const app = express()
const port = process.env.PORT || 3000

const statusCodes = [101, 200, 201, 300, 305, 400, 401, 404, 405, 500, 503]

app.use(expressLogger);
app.use(express.json()) // for parsing application/json

app.get('/ping', (req, res) => {
    res.send({
        message : "pong!"
    })
})

app.get('/delay', (req, res) => {
    logger.info({headers: req.headers});
    if (!req.headers['x-delay']) {
       return res.status(200).send({success: true});
   } else {
       let delay = req.headers['x-delay']
    setTimeout((() => {
        res.send({
            delay: delay,
            headers : req.headers
    	})
    }), delay)
   }
})

app.get('/headers', (req, res) => {
    logger.info({headers: req.headers});
    res.send({
        headers : req.headers
    })
})

app.get('/auth', (req, res) => {
   logger.info({headers: req.headers});
   if (!req.headers['x-api-key']) {
       return res.status(400).send({success: false});
   }
   res.send({success: true})
});

app.get('/test-secret', (req, res) => {
    logger.info({headers: req.headers});
    if (req.headers['x-secret'] && req.headers['x-secret'].startsWith('<<<')) {
        logger.info('Secret True')
        logger.info(req.headers)
        return res.send({success: true})
    }
    return res.status(400).send({success: false});
 });

app.get('/test-header', (req, res) => {
    logger.info({headers: req.headers});
    if (req.headers['x-header-only']){
        logger.info('Header Only')
        logger.info(req.headers)
        return res.send({success: true})
    } else if (req.headers['x-header-value'] && req.headers['x-header-value'] == '123' ){
        logger.info('Header and Value')
        logger.info(req.headers)
        return res.send({success: true})
    }
    return res.status(400).send({success: false});
 });

 app.get('/test-multiheader', (req, res) => {
    logger.info({headers: req.headers});
    if (!req.headers['x-header-only']){
        return res.status(400).send({success: false});
    }
    if (!req.headers['x-header-value'] && !req.headers['x-header-value'] == '123' ){
        return res.status(400).send({success: false});
    }
    res.send({success: true})
 });

 app.post('/events', (req, res) => {
    if(req.query.status === 'random') {
        const code = statusCodes[Math.floor(statusCodes.length * Math.random())]
        res.status(code).send({success: true, code})
        return
    }
    if(req.query.status) {
        const code = req.query.status
        res.status(code).send({success: true, code})
        return
    }
    logger.info({msg: 'Request body', reqBody: req.body, headers: req.headers})
    res.send({success: true, 'message': 'no query params. default response'})
 });

app.get('/delay-query', (req, res) => {
    logger.info({headers: req.headers});
    let delay = req.query.delay ? req.query.delay : 2000
    setTimeout((() => {
        res.send({
            delay: delay,
            headers : req.headers
    	})
    }), delay)
})

app.listen(port, () => {
    logger.info('Server running on port %d', port);
})
