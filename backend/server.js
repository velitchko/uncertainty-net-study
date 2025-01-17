const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('uuid');
const cors = require('cors');

const uncertaintyEncApproaches = [ 'fuzzy', 'saturate', 'enclose', 'wiggle' ];
const taskCodes = [ 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8' ];

const taskDescriptions = new Map([
    ['t1', 'Which node has the largest attribute? If multiple answers are possible, select only one.'],
    ['t2', 'Which node has the smallest attribute? If multiple answers are possible, select only one.'],
    ['t3', 'Which node\'s attribute is the least certain? If multiple answers are possible, select only one.'],
    ['t4', 'Which node\'s attribute is the most certain? If multiple answers are possible, select only one.'],
    ['t5', 'Estimate the number of nodes in the graph.'],
    ['t6', 'Estimate the number of edges in the graph.'],
    ['t7', 'Which node has the largest number of neighbors? If multiple answers are possible, select only one.'],
    ['t8', 'Which node has the fewest number of neighbors? If multiple answers are possible, select only one.']
]);

const threshold = 10;

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
        const params = file.split('#')[0];
        const [encoding, dataset, level] = params.split('_');
        userAssignments[encoding][dataset][level]++;
    });

    let assignedEncoding, assignedDataset, assignedLevel;

    for (const encoding of uncertaintyEncApproaches) {
        for (const dataset of ['raccoons', 'ants']) {
            for (const level of ['low', 'high']) {
                console.log(encoding, dataset, level, userAssignments[encoding][dataset][level], userAssignments[encoding][dataset][level] < threshold);
                if (userAssignments[encoding][dataset][level] < threshold) {
                    assignedEncoding = encoding;
                    assignedDataset = dataset;
                    assignedLevel = level;
                    userAssignments[encoding][dataset][level]++;

                    console.log('🔥 Assigned:', assignedEncoding, assignedDataset, assignedLevel);
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
    filePath = `${__dirname}/data/${req.body.params.encoding}_${req.body.params.dataset}_${req.body.params.level}#${req.body.params.userId}.json`;
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
