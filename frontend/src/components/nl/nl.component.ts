import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, NodeExt, Edge, EdgeExt, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { CONFIG } from '../../assets/config';

@Component({
    selector: 'app-nl',
    templateUrl: './nl.component.html',
    styleUrls: ['./nl.component.scss']
})
export class NlComponent implements OnInit {
    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, NodeExt, any, any>;
    private edgesSelection: d3.Selection<SVGLineElement, EdgeExt, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private errorService: GlobalErrorHandler) {
        this.nodes = this.dataService.getDatasetNodes('nodelink') as Array<NodeExt>;
        this.edges = this.dataService.getDatasetEdges('nodelink') as Array<EdgeExt>;

        this.nodesSelection = d3.select('#nl-container').selectAll('circle.node');
        this.edgesSelection = d3.select('#nl-container').selectAll('line.link');
        this.textsSelection = d3.select('#nl-container').selectAll('text.label');

        this.zoom = d3.zoom();
    }

    ngOnInit(): void {
        try {
            this.draw();
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    colorFill(hop: number): string {
        switch (hop) {
            case -1:
                return 'black';
            case 0:
                return '#fc8d62';
            case 1:
                return '#a6cee3';
            case 2:
                return '#1f78b4';
            case 3:
                return '#b2df8a';
            case 4:
                return '#33a02c';
            default:
                return 'black';
        }
    }

    colorStroke(hop: number): string {
        switch (hop) {
            case -1:
                return 'black';
            case 0:
                return 'black';
            case 1:
                return '#a6cee3';
            case 2:
                return '#1f78b4';
            case 3:
                return '#b2df8a';
            case 4:
                return '#33a02c';
            default:
                return 'black';
        }
    }

    mouseover($event: MouseEvent) {
        // highlight node and its edges
        // get id of currently selected node
        const id = ($event.target as any).id.replace('node-', '');

        // set opacity of all no    des to 0.1
        this.nodesSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);
        
        // set opacity of all edges to 0.1
        this.edgesSelection
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY);

        // set opacity of all texts to 0.1
        this.textsSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);

        // set opacity of current node to 1
        d3.select(`#node-${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        d3.select(`#label-${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY)
            .style('font-weight', 'bold');

        // find targets or sourcdes of current node in this.edges
        const neighbors = new Array<string | number>();
        
        this.edges.forEach((d: EdgeExt) => {
            if(d.source.id.toString().replace('.', '') === id) {
                neighbors.push(d.target.id.toString().replace('.', ''));
            } 
            if(d.target.id.toString().replace('.', '') === id) {
                neighbors.push(d.source.id.toString().replace('.', ''));
            }
        });

        // set opacity of nodes to 1
        this.nodesSelection
            .filter((d: NodeExt) => {
                // console.log(d)
                return neighbors.includes(d.id.toString().replace('.', ''));
            })
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);
        
        // set opacity of edges to 1
        this.edgesSelection
            .filter((d: EdgeExt) => {
                return (neighbors.includes(d.source.id.toString().replace('.', '')) && d.target.id.toString().replace('.', '') == id) ||
                        (neighbors.includes(d.target.id.toString().replace('.', '')) && d.source.id.toString().replace('.', '') == id);
            })
            .attr('stroke', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_HIGHILIGHT_OPACITY);

        // set opacity of texts to 1
        this.textsSelection
            .filter((d: NodeExt) => {
                return neighbors.includes(d.id.toString().replace('.', ''));
            })
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY)
            .style('font-weight', 'bold');
    }

    mouseout() {
        // reset opacity
        this.nodesSelection
            .attr('fill', CONFIG.COLOR_CONFIG.NODE)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.edgesSelection
            .attr('stroke', CONFIG.COLOR_CONFIG.EDGE_STROKE)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('font-weight', 'normal')
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);
    }

    draw() {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#nl-container').selectAll('g')
                    .attr('transform', $event.transform);
            });
        // set svg width and height
        const svg = d3.select('#nl-container')
            .attr('width', CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('height', CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM)
            .call(this.zoom.bind(this));

        // append g element and add zoom and drag to it 
        const g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');

        // Initialize the links
        const edges = g.append('g')
            .attr('id', 'links');

        this.edgesSelection = edges.selectAll('.link')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', (d: EdgeExt) => CONFIG.COLOR_CONFIG.EDGE_STROKE) // TODO: Define d.hop from original code
            .attr('stroke-width', (d: EdgeExt) => CONFIG.SIZE_CONFIG.EDGE_STROKE) // TODO: Define weight from original code
            .attr('stroke-opacity', 0);

        // Initialize the nodes
        const nodes = g.append('g')
            .attr('id', 'nodes');

        this.nodesSelection = nodes.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', (d: NodeExt) => `node-${d.id.toString().replace('.', '')}`)
            .attr('r', CONFIG.SIZE_CONFIG.NODE)
            .attr('stroke', (d: NodeExt) => CONFIG.COLOR_CONFIG.NODE_STROKE) // TODO: Define d.hop from original code
            .attr('stroke-opacity', 0) // TODO: Define weight from original code
            .attr('fill', (d: NodeExt) => CONFIG.COLOR_CONFIG.NODE) // TODO: Define d.hop from original code
            .attr('fill-opacity', 0)
            .style('cursor', 'pointer')
            .on('mouseover', this.mouseover.bind(this))
            .on('mouseout', this.mouseout.bind(this));

        // Text
        const texts = g.append('g')
            .attr('id', 'labels');

        this.textsSelection = texts.selectAll('.label')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('id', (d: NodeExt) => `label-${d.id.toString().replace('.', '')}`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', CONFIG.SIZE_CONFIG.LABEL_SIZE)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', 0)
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .text(() => Math.floor(Math.random() * 99))
        // .on('mouseover', this.mouseover.bind(this))
        // .on('mouseout', this.mouseout.bind(this));
        //.text(d => d.id)

        // Let's list the force we wanna apply on the network
        d3.forceSimulation<Node>(this.nodes)
            .force('link',
                d3.forceLink<NodeExt, EdgeExt>()
                    .strength(0.25)
                    .id((d: NodeExt) => d.id)
                    .links(this.edges)
            )
            .force('charge',
                d3.forceManyBody<NodeExt>()
                    .strength(-200))
            .force('center',
                d3.forceCenter(
                    (CONFIG.WIDTH) / 2.0,
                    (CONFIG.HEIGHT) / 2.0))
            .on('end', this.ticked.bind(this));
    }

    ticked() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => d.source.x)
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => d.target.x)
            .attr('y2', (d: EdgeExt) => d.target.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        console.log(this.nodes);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.LABEL_OPACITY_DEFAULT);
    }
}
