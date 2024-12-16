import { AfterViewInit, Component } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, Aesth, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ResultsService } from '../../services/results.service';

type NodeExt = Node & { x: number, y: number };
type EdgeExt = Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-saturate',
    templateUrl: './saturate.component.html',
    styleUrls: ['./saturate.component.scss']
})

export class SaturateComponent implements AfterViewInit {
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
        console.log('SaturateComponent: ngOnInit');
        const meta = d3.select('#metadata').text().trim();
        const dataset = meta.split('-')[0];
        const variant = meta.split('-')[1];
        const level = meta.split('-')[2];
        const task = meta.split('-')[3];

        console.log('SaturateComponent: ngAfterViewInit: dataset', dataset);
        console.log('SaturateComponent: ngAfterViewInit: variant', variant);
        console.log('SaturateComponent: ngAfterViewInit: level', level);
        console.log('SaturateComponent: ngAfterViewInit: task', task);

        const finalLevel = this.dataService.getFinalLevel(task, level);
        const fileName = `${dataset}_${variant}.${finalLevel}.json`;

        console.log('SaturateComponent: ngAfterViewInit: fileName', fileName);

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

    private saturate(variance: number): d3.RGBColor {
        let c = d3.color('red');
        if (c) {
            c = d3.hsl(c);
            c.s = 1 - variance;
            return d3.rgb(c);
        }
        return d3.rgb('red');
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

    drawGraph(graph: { nodes: NodeExt[], edges: EdgeExt[] }): void {
        const svg = d3.select('#saturate-container')
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
                .attr('r', (d: NodeExt) => this.nodeR(d.mean) + 10)
                .attr('fill', (d: NodeExt) => this.saturate(d.variance).toString());

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
            .force('link', d3.forceLink(graph.edges).id((d: any) => (d as NodeExt).id).strength(this.aesthetics.strength).links(graph.edges))
            .force('charge', d3.forceManyBody().strength(this.aesthetics.charge))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .on('tick', this.ticked.bind(this));
    }
}
