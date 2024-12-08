const express = require('express');
const fs = require('fs');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const uncertaintyEncApproaches = [ 'fuzzy', 'saturate', 'enclose', 'wiggle' ];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5', 't6' ];

const taskDescriptions = new Map([
    ['t1', ''],
    ['t2', ''],
    ['t3', ''],
    ['t4', ''],
    ['t5', ''],
    ['t6', '']
]);

// check the length of the files in the data dir and assign task accordingly 
// keep track of number of results per task to guarantee at least 48 submissions exist for each task 
const taskThresholdMap = new Map([
    ['t1', 48],
    ['t2', 48],
    ['t3', 48],
    ['t4', 48],
    ['t5', 48]
]);

const encodingThresholdMap = new Map([
    ['fuzzy', 25],
    ['saturate', 25],
    ['enclose', 25],
    ['wiggle', 25]
]);

// create a tracker for every user that visits the site
let userTracker = new Map();

const pilot = false;

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();

    // let randomEgoNetApproaches, randomTaskCode; 
    
    // get random order of ego-net approaches
    // randomEgoNetApproaches = squares.get(userTracker.size % 4);

    let randomEncoding = uncertaintyEncApproaches[0]; // start with matrix
    
    // get list of file names in logs directory
    let logFiles = fs.readdirSync(`${__dirname}/logs`);
    let submissionFiles = fs.readdirSync(`${__dirname}/data`);

    // get array of file names
    let logFileNames = logFiles.map(file => file.split('-')[1].split('.')[0]);
    let submissionFileNames = submissionFiles.map(file => file.split('-')[1]);


    console.log('🪵 Log files:', logFileNames);
    console.log('🗄️ Submission files:', submissionFileNames);

    // WITHIN SUBJECT SETUP
    // taskThresholdMap.forEach((threshold, task) => {
    //     console.log('🔢 Task:', task, threshold);
    //     const logTaskCount = logFileNames.filter(fileName => fileName.includes(task)).length;
    //     const submissionTaskCount = submissionFileNames.filter(fileName => fileName.includes(task)).length;
        
    //     // Cross validate with submission count of the respective task
    //     if (Math.min(logTaskCount, submissionTaskCount) >= threshold) {
    //         // if log count is greater than or equal to threshold
    //         // check if submission count is greater than or equal to threshold -> move to next
    //         randomTaskCode = taskCodes[taskCodes.indexOf(task) + 1] || taskCodes[0];
    //         console.log(`📁 File count Task ${task}: Logs(${logTaskCount}), Submissions(${submissionTaskCount})`);
    //         console.log('📈 Threshold reached for task:', task);
    //         console.log('➡️ Moving to next task...', randomTaskCode);
    //     } 
    // });

    if(pilot) {
        // for each next user, loop over the ego-net approaches
        // and assign the next encoding
        // randomEncoding = egoNetApproaches[userTracker.size % egoNetApproaches.length];
        console.log('🔢 Random encoding:', randomEncoding); 
    }
    else {
        encodingThresholdMap.forEach((threshold, encoding) => {
            console.log('🔢 Encoding:', encoding, threshold);
            const logEncodingCount = logFileNames.filter(fileName => fileName.includes(encoding)).length;
            const submissionEncodingCount = submissionFileNames.filter(fileName => fileName.includes(encoding)).length;
            
            // Cross validate with submission count of the respective task
            if (Math.min(logEncodingCount, submissionEncodingCount) >= threshold) {
                // if log count is greater than or equal to threshold
                // check if submission count is greater than or equal to threshold -> move to next
                randomEncoding = egoNetApproaches[egoNetApproaches.indexOf(encoding) + 1] || egoNetApproaches[0];
                // console.log(`📁 File count Encoding ${task}: Logs(${logEncodingCount}), Submissions(${submissionEncodingCount})`);
                console.log('📈 Threshold reached for encoding:', encoding);
                console.log('➡️ Moving to next encoding...', randomEncoding);
                return;
            } 
        });
    }
    // Send a single representation for each tasks randomize the tasks randomly

    // console.log('🔢 Random ego-net approaches:', randomEgoNetApproaches);
    // console.log('🔢 Random task code:', randomTaskCode);
    const randomizedTaskOrder = taskCodes.sort(() => Math.random() - 0.5);
    const randomizedTaskDescription = randomizedTaskOrder.map(task => taskDescriptions.get(task));

    userTracker.set(user, {
        uncertaintyEncApproach: randomEncoding,
        taskCodes: randomizedTaskOrder,
        taskDescriptions: randomizedTaskDescription
    });
    
    let params = {
        user: user,
        uncertaintyEncApproach: randomEncoding,
        taskCodes: randomizedTaskOrder,
        taskDescriptions: randomizedTaskDescription
    };
    // write id and params to file
    fs.writeFileSync(`${__dirname}/logs/logs-${randomEncoding}-${user}.json`, JSON.stringify(params));

    console.log('🔍 Query parameters:', params);

    res.send({
        status: 200,
        message: '👍',
        user: params
    });
});

app.post('/results', (req, res) => {
    filePath = `${__dirname}/data/data-${req.body.params.egoNetApproach}-${req.body.params.user}.json`;
    console.log('📝 Writing to file...', filePath);

    fs.writeFileSync(filePath, JSON.stringify(req.body.results));
    res.send({
        status: 200,
        message: '👍'
    });
});

// start the server
app.listen(8080)
    .on('error', (err) => {
        console.log(`🚒 ${err}`);
    }).on('listening', () => {
        console.log('🚀 Server is listening at http://localhost:8080');
    });
