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

app.post('/samplepost', (req,res) => {
    logger.info({headers: req.headers});
    
    return res.json({"status":{"code":200,"is_success":true,"user_message":"Success!","developer_message":""},"data":{"id":50019884,"trigger_id":50734997,"account_id":43180,"environment_id":71205,"project_id":81381,"job_definition_id":67922,"status":1,"dbt_version":"1.0.0","git_branch":null,"git_sha":null,"status_message":null,"owner_thread_id":null,"executed_by_thread_id":null,"deferring_run_id":null,"artifacts_saved":false,"artifact_s3_path":null,"has_docs_generated":false,"has_sources_generated":false,"notifications_sent":false,"blocked_by":[],"scribe_enabled":true,"created_at":"2022-03-31 09:23:58.497823+00:00","updated_at":"2022-03-31 09:23:58.497839+00:00","dequeued_at":null,"started_at":null,"finished_at":null,"last_checked_at":null,"last_heartbeat_at":null,"should_start_at":null,"trigger":{"id":50734997,"cause":"Triggered by Harness","job_definition_id":67922,"git_branch":"env/staging","git_sha":null,"azure_pull_request_id":null,"github_pull_request_id":null,"gitlab_merge_request_id":null,"schema_override":null,"dbt_version_override":null,"threads_override":null,"target_name_override":null,"generate_docs_override":null,"timeout_seconds_override":null,"steps_override":null,"created_at":"2022-03-31 09:23:58.485133+00:00","cause_humanized":"Triggered by Harness","job":null},"job":{"execution":{"timeout_seconds":0},"generate_docs":true,"run_generate_sources":false,"id":67922,"account_id":43180,"project_id":81381,"environment_id":71205,"name":"STG Refresh","dbt_version":null,"created_at":"2022-03-15T10:17:35.755212Z","updated_at":"2022-03-16T12:43:03.583278Z","execute_steps":["dbt build --select +marts.core.ma-em.*"],"state":1,"deactivated":false,"run_failure_count":0,"deferring_job_definition_id":null,"lifecycle_webhooks":false,"lifecycle_webhooks_url":null,"triggers":{"github_webhook":false,"git_provider_webhook":false,"custom_branch_only":false,"schedule":false},"settings":{"threads":4,"target_name":"stg"},"schedule":{"cron":"0 * * * *","date":"every_day","time":"every_hour"},"is_deferrable":false},"environment":null,"run_steps":[],"status_humanized":"Queued","in_progress":true,"is_complete":false,"is_success":false,"is_error":false,"is_cancelled":false,"href":"https://cloud.getdbt.com/#/accounts/43180/projects/81381/runs/50019884/","duration":"00:00:00","queued_duration":"00:00:00","run_duration":"00:00:00","duration_humanized":"0 minutes","queued_duration_humanized":"0 minutes","run_duration_humanized":"0 minutes","created_at_humanized":"0 minutes ago","finished_at_humanized":"0 minutes from now","job_id":67922,"is_running":null}}).status(200);
})

app.get('/redirect', (req, res) => {
    logger.info({headers: req.headers});
    
    res.setHeader('Location', 'https://ex-node-app.herokuapp.com/finaldestination')
    return res.status(302).send({success: true});
})

app.get('/finaldestination', (req, res) => {
    logger.info({headers: req.headers});
    
    return res.status(204).send({success: true});
})

app.listen(port, () => {
    logger.info('Server running on port %d', port);
})
