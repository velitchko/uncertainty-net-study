import { Injectable } from '@angular/core';
import { DATA_TUTORIAL } from '../assets/tutorial';
import { CONFIG } from '../assets/config';

export type Node = { 
    id: string | number, 
    label: string, 
    index: number,
    weight: number, 
    variance: number
};
export type Edge = { source: string | number, target: string | number, weight: number};

@Injectable({
    providedIn: 'root'
})

export class DataService {
    private datasets: Map<string, any> = new Map([
    ]);

    private tutorialData: any; 

    private parsedData: Map<string, { nodes: Array<Node>, edges: Array<Edge> }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge> }>();
        // iterate over datasets and parse data from json file in assets dir
        this.datasets.forEach((data: any, key: string) => {
            const parsed = this.parseData(data);
            this.parsedData.set(key, { nodes: parsed.nodes, edges: parsed.links });
        });
        this.tutorialData = this.parseData(DATA_TUTORIAL);
    }

    getTutorialNodes(): Array<Node> {
        return this.tutorialData.nodes;
    }

    getTutorialEdges(): Array<Edge> {
        return this.tutorialData.links;
    }

    getGraph(key: string): Promise<{ nodes: Array<Node>, edges: Array<Edge> }> {
        return new Promise((resolve, reject) => {
            if(this.parsedData.has(key)) {
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
        if(key === 'tutorial') return this.getTutorialNodes();

        return this.parsedData.get(key)?.nodes.slice() || this.parseData('t1').nodes.slice();
    }

    getDatasetEdges(key: string): Array<Edge> {
        if(key === 'tutorial') return this.getTutorialEdges();

        return this.parsedData.get(key)?.edges.slice() ||  this.parseData('t1').links.slice();
    }

    parseData(data: any): { nodes: Array<Node>, links: Array<Edge> } {
        const nodes = data.nodes;
        const edges = data.links;
        
        const parsedNodes = new Array<Node>();
        const parsedEdges = new Array<Edge>();

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
                target: edge.target,
                weight: edge.weight
            });
        });

        return {
            nodes: parsedNodes,
            links: parsedEdges,
        };
    }
}