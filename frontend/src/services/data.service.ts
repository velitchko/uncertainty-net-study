import { Injectable } from '@angular/core';

export type Node = {
    id: string | number,
    label: string,
    index: number,
    mean: number,
    variance: number
};
export type Edge = { source: string | number, target: string | number };

export type Aesth = { strength: number, charge: number, xoffset: number, yoffset: number };

export type Graph = { nodes: Array<Node>, edges: Array<Edge>, aesthetics: Aesth };

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

    public async loadFilename(fileName: string): Promise<Graph> {
        fileName = fileName.replace('.json', '');

        const dataset = fileName.split('_')[0];

        const nodeFile = this.unprocessedData.get(fileName)?.nodeFile || '';
        const edgeFile = this.unprocessedData.get(fileName)?.edgeFile || '';
        const aesthFile = this.unprocessedData.get(fileName)?.aestheticsFile || '';

        const nodeResponse = await fetch(`${this.dataDir}${dataset}/${nodeFile}`).then(response => response.json());
        const nodes = this.parseNodes(nodeResponse);
        this.parsedData.set(fileName, { nodes: nodes.nodes, edges: [], aesthetics: { strength: 0, charge: 0, xoffset: 0, yoffset: 0 } });

        const edgeResponse = await fetch(`${this.dataDir}${dataset}/${edgeFile}`).then(response => response.json());

        const edges = this.parseEdges(edgeResponse);
        if (this.parsedData.has(fileName)) {
            const existingData = this.parsedData.get(fileName);
            if (existingData) {
                existingData.edges = edges.edges;
                this.parsedData.set(fileName, existingData);
            }
        }

        const aesthResponse = await fetch(`${this.dataDir}${dataset}/${aesthFile}`);
        const aesthData = await aesthResponse.json();

        const aesthetics = this.parseAesthetics(aesthData);
        if (this.parsedData.has(fileName)) {
            const existingData = this.parsedData.get(fileName);
            if (existingData) {
                existingData.aesthetics = aesthetics;
                this.parsedData.set(fileName, existingData);
            }
        }

        return this.parsedData.get(fileName) || { nodes: [], edges: [], aesthetics: { strength: 0, charge: 0, xoffset: 0, yoffset: 0 } };
    }

    public getFinalLevel(task: string, level: string): string {
        let finalLevel = '';

        const uncertaintyLevel = Math.random() < 0.5 ? '0' : '1';
        const attributeLevel = Math.random() < 0.5 ? '0' : '1';

        switch (task) { 
            case 't1': 
                finalLevel = level === 'low' ? '0.1' : '1.1'; 
                break;
            case 't2': 
                finalLevel = level === 'low' ? '0.0' : '1.0'; 
                break;
            case 't3': 
                finalLevel = level === 'high' ? '0.1' : '0.0'; 
                break;
            case 't4': 
                finalLevel = level === 'high' ? '1.1' : '1.0'; 
                break;
            default: 
                finalLevel = `${uncertaintyLevel}.${attributeLevel}`; 
                break;
        }

        return finalLevel;
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

    loadAllData(): void {
        for (const dataset of this.dataSets) {
            this.loadDataForDataset(dataset);
        }
    }

    getDatasetNames(): Array<string> {
        return Array.from(this.unprocessedData.keys());
    }

    getTutorialNodes(): Array<Node> {
        return this.tutorialData.nodes;
    }

    getTutorialEdges(): Array<Edge> {
        return this.tutorialData.links;
    }

    getGraph(key: string): Promise<{ nodes: Array<Node>, edges: Array<Edge>, aesthetics: Aesth }> {
        return new Promise((resolve, reject) => {
            if (this.parsedData.has(key)) {
                resolve({
                    nodes: this.getDatasetNodes(key) || [],
                    edges: this.getDatasetEdges(key) || [],
                    aesthetics: this.parsedData.get(key)?.aesthetics || { strength: 0, charge: 0, xoffset: 0, yoffset: 0 }
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
        const nodes = data;
        const parsedNodes = new Array<Node>();

        nodes.forEach((node: { id: string | number, mean: number, var: number }, i: number) => {
            parsedNodes.push({
                id: node.id,
                label: `${node.id}`,
                index: i,
                mean: node.mean,
                variance: node.var
            });
        });

        return {
            nodes: parsedNodes
        };
    }

    parseEdges(data: any): { edges: Array<Edge> } {
        const edges = data;
        const parsedEdges = new Array<Edge>();

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