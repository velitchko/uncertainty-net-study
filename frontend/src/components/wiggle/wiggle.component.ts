import { AfterViewInit, Component } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, Aesth, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ResultsService } from '../../services/results.service';

type NodeExt = Node & { x: number, y: number, originalPosition?: [number, number] };
type EdgeExt = Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-wiggle',
    templateUrl: './wiggle.component.html',
    styleUrls: ['./wiggle.component.scss']
})

export class WiggleComponent implements AfterViewInit {
    private margin = {
        top: 10, 
        right: 10, 
        bottom: 10, 
        left: 10
    };
    private width = 1400 - this.margin.left - this.margin.right;
    private height = 1200 - this.margin.top - this.margin.bottom;

    private nodes: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private edges: d3.Selection<SVGLineElement, EdgeExt, SVGGElement, any>;
    private buffer: d3.Selection<SVGCircleElement, NodeExt, SVGGElement, any>;
    private labels: d3.Selection<SVGTextElement, NodeExt, SVGGElement, any>;
    private simulation: d3.Simulation<NodeExt, EdgeExt>;
    private aesthetics: Aesth;

    constructor(private dataService: DataService, private errorHandler: GlobalErrorHandler, private resultsService: ResultsService) { 
    }

    async ngAfterViewInit(): Promise<void> {
        const meta = d3.select('#metadata').text().trim();
        const dataset = meta.split('-')[0];
        const variant = meta.split('-')[1];
        const level = meta.split('-')[2];
        const task = meta.split('-')[3];

        const finalLevel = this.resultsService.getFinalLevel(task, level);

        const fileName = `${dataset}_${variant}.${finalLevel}.json`;

        const graph = await this.dataService.loadFilename(fileName);

        this.aesthetics = graph.aesthetics;

        this.drawGraph({
            nodes: graph.nodes as NodeExt[],
            edges: graph.edges as EdgeExt[]
        });
    }


    private nodeR(mean: number): number {
        return 5 + Math.sqrt(1000*mean / Math.PI);
    }

    private randomMovement(variance: number): number {
        return (Math.random()*2 - 1) * variance * 50;
    }

    private ticked(): void {
        this.edges
            .attr('x1', (d: EdgeExt) => d.source.x + this.aesthetics.xoffset)
            .attr('y1', (d: EdgeExt) => d.source.y + this.aesthetics.yoffset)
            .attr('x2', (d: EdgeExt) => d.target.x + this.aesthetics.xoffset)
            .attr('y2', (d: EdgeExt) => d.target.y + this.aesthetics.yoffset);

        this.buffer
            .attr('cx', (d: NodeExt) => d.x + this.aesthetics.xoffset)
            .attr('cy', (d: NodeExt) => d.y + this.aesthetics.yoffset);

        this.nodes
            .attr('cx', (d: NodeExt) => d.x + this.aesthetics.xoffset)
            .attr('cy', (d: NodeExt) => d.y + this.aesthetics.yoffset);

        this.labels
            .attr('x', (d: NodeExt) => d.x + this.aesthetics.xoffset)
            .attr('y', (d: NodeExt) => d.y + this.aesthetics.yoffset);
    }

    private random(): void {
        const nodes = this.nodes.data() as NodeExt[];

        nodes.forEach((node: NodeExt) => {
            if (node.originalPosition === undefined) {
                node.originalPosition = [node.x + this.aesthetics.xoffset, node.y + this.aesthetics.yoffset];
            } 
            node.x = node.originalPosition[0] + this.randomMovement(node.variance);
            node.y = node.originalPosition[1] + this.randomMovement(node.variance);
        });

        this.nodes
            .transition()
            // .duration(1000)
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.labels
            .transition()
            // .duration(1000)
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y);

        this.buffer
            .transition()
            // .duration(1000)
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.edges
            .transition()
            // .duration(1000)
            .attr('x1', (d: EdgeExt) => d.source.x)
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => d.target.x)
            .attr('y2', (d: EdgeExt) => d.target.y);
            // .on('end', () => { this.simulation.restart(); });
    }

    drawGraph(graph: { nodes: NodeExt[], edges: EdgeExt[] }): void {
        const svg = d3.select('#wiggle-container')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // initialize links
        this.edges = svg.append('g')
            .attr('class', 'edges')
            .selectAll('line')
            .data(graph.edges)
            .enter()
            .append('line')
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.5);

        // initialize buffer
        this.buffer = svg.append('g')
            .attr('class', 'buffers')
            .selectAll('circle.buffer')
            .data(graph.nodes)
            .enter()
            .append('circle')
                .attr('class', 'buffer')
                .attr('r', (d: NodeExt) => this.nodeR(d.mean) + 12)
                .attr('fill', 'white');

        // initialize nodes
        this.nodes = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle.node')
            .data(graph.nodes)
            .enter()
            .append('circle')
                .attr('class', 'node')
                .attr('id', (d: NodeExt) => d.id)
                .attr('r', (d: NodeExt) => this.nodeR(d.mean) + 10)
                .attr('fill', 'red');

        // initialize labels
        this.labels = svg.append('g')
            .attr('class', 'labels')
            .selectAll('text.label')
            .data(graph.nodes)
            .enter()
            .append('text')
                .attr('class', 'label')
                .text((d: NodeExt) => `${d.id}`)
                .attr('stroke', 'black')
                .attr('fill', 'black')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .style('font-family', '\'Fira Mono\', monospace');

        this.simulation = d3.forceSimulation(graph.nodes)
            .force('link', d3.forceLink(graph.edges).id((d: any) => (d as NodeExt).id).distance(this.aesthetics.distance).strength(this.aesthetics.strength).links(graph.edges))
            .force('charge', d3.forceManyBody().strength(this.aesthetics.charge))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .on('tick', this.ticked.bind(this))
            .on('end', () => {
                setInterval(() => {
                    this.random();
                }, 50);
            });
    }
}
