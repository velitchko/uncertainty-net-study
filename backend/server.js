const express = require('express');
const fs = require('fs');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const uncertaintyEncApproaches = [ 'fuzzy', 'saturate', 'enclose', 'wiggle' ];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8' ];

const taskDescriptions = new Map([
    ['t1', 'Which node has the largest attribute? If multiple answers are possible, select only one.'],
    ['t2', 'Which node has the smallest attribute? If multiple answers are possible, select only one.'],
    ['t3', 'Which node’s attribute is the least certain? If multiple answers are possible, select only one.'],
    ['t4', 'Which node’s attribute is the most certain? If multiple answers are possible, select only one.'],
    ['t5', 'Estimate the number of nodes in the graph.'],
    ['t6', 'Estimate the number of edges in the graph.'],
    ['t7', 'Which node has the largest number of neighbors? If multiple answers are possible, select only one.'],
    ['t8', 'Which node has the fewest number of neighbors? If multiple answers are possible, select only one.']
]);

// TODO: Increase to 20 later
const encodingThresholdMap = new Map([
    ['fuzzy', 5],
    ['saturate', 5],
    ['enclose', 5],
    ['wiggle', 5]
]);

// create a tracker for every user that visits the site
let userTracker = new Map();

app.use(express.json());
app.use(cors());

app.get('/params', (req, res) => {
    // keep track of each new user 
    let user = uuid.v4();

    const subsDir = `${__dirname}/data`;

    if (!fs.existsSync(subsDir)) {
        fs.mkdirSync(subsDir);
    }

    const subFiles = fs.readdirSync(subsDir);

    const userAssignments = {
        fuzzy: { raccoons: { low: 0, high: 0 }, ants: { low: 0, high: 0 } },
        saturate: { raccoons: { low: 0, high: 0 }, ants: { low: 0, high: 0 } },
        enclose: { raccoons: { low: 0, high: 0 }, ants: { low: 0, high: 0 } },
        wiggle: { raccoons: { low: 0, high: 0 }, ants: { low: 0, high: 0 } }
    };

    subFiles.forEach(file => {
        const logData = JSON.parse(fs.readFileSync(`${subsDir}/${file}`));
        userAssignments[logData.encoding][logData.dataset][logData.level]++;
    });

    let assignedEncoding, assignedDataset, assignedLevel;

    for (const encoding of uncertaintyEncApproaches) {
        for (const dataset of ['raccoons', 'ants']) {
            for (const level of ['low', 'high']) {
                if (userAssignments[encoding][dataset][level] < 10) {
                    assignedEncoding = encoding;
                    assignedDataset = dataset;
                    assignedLevel = level;
                    userAssignments[encoding][dataset][level]++;
                    break;
                }
            }
            if (assignedEncoding) break;
        }
        if (assignedEncoding) break;
    }

    const sortedTaskCodes = taskCodes.sort(() => Math.random() - 0.5);
    const sortedTaskDescriptions = taskCodes.map(code => taskDescriptions.get(code));

    res.send({
        status: 200,
        message: '👍',
        params: {
            userId: user,
            encoding: assignedEncoding,
            dataset: assignedDataset,
            level: assignedLevel,
            taskCodes: sortedTaskCodes,
            taskDescriptions: sortedTaskDescriptions,
        }
    });
});

app.post('/results', (req, res) => {
    filePath = `${__dirname}/data/${req.body.params.uncertaintyEncApproach}_${req.body.params.dataset}_${req.body.params.level}-${req.body.params.user}.json`;
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
