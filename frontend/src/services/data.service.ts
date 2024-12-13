import { Injectable } from '@angular/core';

export type Node = {
    id: string | number,
    label: string,
    index: number,
    weight: number,
    variance: number
};
export type Edge = { source: string | number, target: string | number };

export type Aesth = { strength: number, charge: number, xoffset: number, yoffset: number };

@Injectable({
    providedIn: 'root'
})

export class DataService {
    private dataDir = 'assets/datasets/';
    private dataSets: Array<string> = ['ants', 'raccoons'];
    private dataFiles: Array<string> = [
        'aesth.1.json',
        'aesth.2.json',
        'aesth.3.json',
        'aesth.4.json',
        'aesth.5.json',
        'aesth.6.json',
        'aesth.7.json',
        'aesth.8.json',
        'edges.1.0.0.json',
        'edges.1.0.1.json',
        'edges.1.1.0.json',
        'edges.1.1.1.json',
        'edges.2.0.0.json',
        'edges.2.0.1.json',
        'edges.2.1.0.json',
        'edges.2.1.1.json',
        'edges.3.0.0.json',
        'edges.3.0.1.json',
        'edges.3.1.0.json',
        'edges.3.1.1.json',
        'edges.4.0.0.json',
        'edges.4.0.1.json',
        'edges.4.1.0.json',
        'edges.4.1.1.json',
        'edges.5.0.0.json',
        'edges.5.0.1.json',
        'edges.5.1.0.json',
        'edges.5.1.1.json',
        'edges.6.0.0.json',
        'edges.6.0.1.json',
        'edges.6.1.0.json',
        'edges.6.1.1.json',
        'edges.7.0.0.json',
        'edges.7.0.1.json',
        'edges.7.1.0.json',
        'edges.7.1.1.json',
        'edges.8.0.0.json',
        'edges.8.0.1.json',
        'edges.8.1.0.json',
        'edges.8.1.1.json',
        'nodes.1.0.0.json',
        'nodes.1.0.1.json',
        'nodes.1.1.0.json',
        'nodes.1.1.1.json',
        'nodes.2.0.0.json',
        'nodes.2.0.1.json',
        'nodes.2.1.0.json',
        'nodes.2.1.1.json',
        'nodes.3.0.0.json',
        'nodes.3.0.1.json',
        'nodes.3.1.0.json',
        'nodes.3.1.1.json',
        'nodes.4.0.0.json',
        'nodes.4.0.1.json',
        'nodes.4.1.0.json',
        'nodes.4.1.1.json',
        'nodes.5.0.0.json',
        'nodes.5.0.1.json',
        'nodes.5.1.0.json',
        'nodes.5.1.1.json',
        'nodes.6.0.0.json',
        'nodes.6.0.1.json',
        'nodes.6.1.0.json',
        'nodes.6.1.1.json',
        'nodes.7.0.0.json',
        'nodes.7.0.1.json',
        'nodes.7.1.0.json',
        'nodes.7.1.1.json',
        'nodes.8.0.0.json',
        'nodes.8.0.1.json',
        'nodes.8.1.0.json',
        'nodes.8.1.1.json',
    ];


    private tutorialData: any;
    private parsedData: Map<string, { nodes: Array<Node>, edges: Array<Edge>, aesthetics: Aesth }>;
    private unprocessedData: Map<string, { nodeFile: string, edgeFile: string, aestheticsFile: string, dataset: string, level: string, variant: number }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge>, aesthetics: Aesth }>();
        this.unprocessedData = new Map<string, { nodeFile: string, edgeFile: string, aestheticsFile: string, dataset: string, level: string, variant: number }>();
        this.loadAllData();
    }

    private async loadAndParseData(fileName: string): Promise<void> {
        const response = await fetch(`${this.dataDir}${fileName}`);
        console.log(response);
        const data = await response.json();

        console.log(data);
        if (fileName.startsWith('nodes')) {
            const nodes = this.parseNodes(data);
            if (this.parsedData.has(fileName)) {
                const existingData = this.parsedData.get(fileName);
                if (existingData) {
                    existingData.nodes = nodes.nodes;
                    this.parsedData.set(fileName, existingData);
                }
            } else {
                // this.parsedData.set(fileName, { nodes: nodes.nodes, edges: [] });
                console.log('Should not happen');
            }

        } else if (fileName.startsWith('edges')) {
            const edges = this.parseEdges(data);
            if (this.parsedData.has(fileName)) {
                const existingData = this.parsedData.get(fileName);
                if (existingData) {
                    existingData.edges = edges.edges;
                    this.parsedData.set(fileName, existingData);
                }
            } else {
                // this.parsedData.set(fileName, { nodes: [], edges: edges.edges });
                console.log('Should not happen');
            }
        } else {
            throw new Error(`Unknown file type: ${fileName}`);
        }
    }

    private loadDataForDataset(dataset: string): void {
        const aestheticsFiles = this.dataFiles.filter(file => file.startsWith('aesth'));
        const nodesFiles = this.dataFiles.filter(file => file.startsWith('nodes'));
        const edgesFiles = this.dataFiles.filter(file => file.startsWith('edges'));

        for (const file of nodesFiles) {
            const key = `${dataset}/${file}`;
            const label = key.replace('.json', '').replace('nodes.', '').replace('/', '_');
            const level = file.includes('1.1') ? 'high' : 'low';
            const variant = parseInt(file.split('.')[1]);

            this.unprocessedData.set(label, {
                nodeFile: file,
                edgeFile: '',
                aestheticsFile: '',
                dataset: dataset,
                level: level,
                variant: variant
            });
        }

        for (const file of edgesFiles) {
            const key = `${dataset}/${file}`;
            const label = key.replace('.json', '').replace('edges.', '').replace('/', '_');
            const level = file.includes('1.1') ? 'high' : 'low';
            const variant = parseInt(file.split('.')[1]);

            if (this.unprocessedData.has(label)) {
                const existingData = this.unprocessedData.get(label);
                if (existingData) {
                    existingData.edgeFile = file;
                    this.unprocessedData.set(label, existingData);
                }
            } else {
                this.unprocessedData.set(label, {
                    nodeFile: '',
                    edgeFile: file,
                    aestheticsFile: '',
                    dataset: dataset,
                    level: level,
                    variant: variant
                });
            }
        }

        for (const file of aestheticsFiles) {
            const variant = parseInt(file.split('.')[1]);

            this.unprocessedData.forEach((value, existingKey) => {
            if (existingKey.startsWith(dataset) && value.variant === variant) {
                value.aestheticsFile = file;
                this.unprocessedData.set(existingKey, value);
            }
            });
        }
    }

    loadAllData():void {
        for (const dataset of this.dataSets) {
            this.loadDataForDataset(dataset);
        }
    }

    getTutorialNodes(): Array<Node> {
        return this.tutorialData.nodes;
    }

    getTutorialEdges(): Array<Edge> {
        return this.tutorialData.links;
    }

    getGraph(key: string): Promise<{ nodes: Array<Node>, edges: Array<Edge> }> {
        return new Promise((resolve, reject) => {
            if (this.parsedData.has(key)) {
                resolve({
                    nodes: this.getDatasetNodes(key) || [],
                    edges: this.getDatasetEdges(key) || [],
                });
            } else {
                reject('No data found for key: ' + key);
            }
        });
    }

    // get data per task type
    getDatasetNodes(key: string): Array<Node> {
        if (key === 'tutorial') return this.getTutorialNodes();

        return this.parsedData.get(key)?.nodes.slice() || [];
    }

    getDatasetEdges(key: string): Array<Edge> {
        if (key === 'tutorial') return this.getTutorialEdges();

        return this.parsedData.get(key)?.edges.slice() || [];
    }

    parseAesthetics(data: any): Aesth {

        return {
            strength: data.strength || 0,
            charge: data.charge || 0,
            xoffset: data.xoffset || 0,
            yoffset: data.yoffset || 0
        };
    }

    parseNodes(data: any): { nodes: Array<Node> } {
        const nodes = data.nodes;

        const parsedNodes = new Array<Node>();

        // parse nodes
        // id: string | number, label: string, index: number, ego: string | number, hop: number, weight: number, parent: string | number };
        nodes.forEach((node: { id: string | number, weighted: number, var: number }, i: number) => {
            parsedNodes.push({
                id: node.id,
                label: `${node.id}`,
                index: i,
                weight: node.weighted,
                variance: node.var
            });
        });


        return {
            nodes: parsedNodes
        };
    }

    parseEdges(data: any): { edges: Array<Edge> } {
        const edges = data.links;


        const parsedEdges = new Array<Edge>();

        // parse edges
        let edgeHash = new Map<string, Edge>();
        edges.forEach((edge: { source: string | number, target: string | number, weight: number }, i: number) => {
            let idA: string, idB: string = '';
            if (edge.source === edge.target) return;

            idA = `${edge.source}-${edge.target}`;
            idB = `${edge.target}-${edge.source}`;

            edgeHash.set(idA, edge);
            edgeHash.set(idB, edge);

            parsedEdges.push({
                source: edge.source,
                target: edge.target
            });
        });

        return {
            edges: parsedEdges
        };
    }
}