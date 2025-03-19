// @ts-ignore - Ignore d3 module type issues in browser
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
export class DependencyGraph {
    constructor(data) {
        this.data = data;
        this.currentView = 'graph';
        this.width = window.innerWidth;
        this.height = window.innerHeight - 120; // Account for header/footer
        this.setupViewControls(); // Set up view controls first
        this.initializeGraph();
        this.setupGraphListeners();
    }
    setupViewControls() {
        // View controls - only set up once
        document.getElementById('graphView')?.addEventListener('click', () => {
            if (this.currentView !== 'graph') {
                this.currentView = 'graph';
                this.switchView('graph');
            }
        });
        document.getElementById('treeView')?.addEventListener('click', () => {
            if (this.currentView !== 'tree') {
                this.currentView = 'tree';
                this.switchView('tree');
            }
        });
        document.getElementById('tableView')?.addEventListener('click', () => {
            if (this.currentView !== 'table') {
                this.currentView = 'table';
                this.switchView('table');
            }
        });
        // Search - only set up once
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        // Window resize - only set up once
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight - 120;
            if (this.svg) {
                this.svg
                    .attr('width', this.width)
                    .attr('height', this.height);
                if (this.currentView === 'graph' && this.simulation) {
                    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
                    this.simulation.alpha(1).restart();
                }
                else {
                    this.switchView(this.currentView);
                }
            }
        });
    }
    setupGraphListeners() {
        // Node hover
        this.g.selectAll('.node')
            .on('mouseover', (event, d) => {
            const tooltip = d3.select('.tooltip');
            tooltip.style('display', 'block')
                .html(`
            <div>
              <strong>${d.name}@${d.version}</strong><br>
              ${d.license ? `License: ${d.license}<br>` : ''}
              ${d.size ? `Size: ${this.formatSize(d.size)}<br>` : ''}
              ${d.duplicateOf ? 'Duplicate' : ''}
            </div>
          `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
            .on('mouseout', () => {
            d3.select('.tooltip').style('display', 'none');
        })
            .on('click', (event, d) => this.showPackageDetails(d));
    }
    switchView(view) {
        // Clear existing content
        d3.select('#graph').selectAll('*').remove();
        if (view !== 'table') {
            // Reset SVG and group for graph and tree views
            this.svg = d3.select('#graph')
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height);
            // Add zoom behavior
            this.zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
            this.svg.call(this.zoom);
            // Create main group
            this.g = this.svg.append('g');
            // Reinitialize simulation if switching to graph view
            if (view === 'graph') {
                this.simulation = d3.forceSimulation()
                    .force('link', d3.forceLink().id((d) => d.id).distance(100))
                    .force('charge', d3.forceManyBody().strength(-300))
                    .force('center', d3.forceCenter(this.width / 2, this.height / 2));
            }
        }
        switch (view) {
            case 'tree':
                this.renderTreeView();
                break;
            case 'table':
                this.renderTableView();
                break;
            default:
                this.renderGraph();
        }
        // Set up graph-specific listeners if needed
        if (view !== 'table') {
            this.setupGraphListeners();
        }
    }
    initializeGraph() {
        // Create SVG
        this.svg = d3.select('#graph')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        // Add zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
            this.g.attr('transform', event.transform);
        });
        this.svg.call(this.zoom);
        // Create main group for graph
        this.g = this.svg.append('g');
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id((d) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.renderGraph();
    }
    renderGraph() {
        const nodes = this.hierarchyToNodes(this.data);
        const links = this.hierarchyToLinks(nodes);
        // Create links
        const link = this.g.selectAll('.link')
            .data(links)
            .join('path')
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrow)');
        // Create nodes
        const node = this.g.selectAll('.node')
            .data(nodes)
            .join('g')
            .attr('class', (d) => `node ${this.getNodeClass(d)}`)
            .call(d3.drag()
            .on('start', this.dragstarted.bind(this))
            .on('drag', this.dragged.bind(this))
            .on('end', this.dragended.bind(this)));
        // Add circles to nodes
        node.append('circle')
            .attr('r', 5);
        // Add labels to nodes
        node.append('text')
            .attr('dy', '0.31em')
            .attr('x', 8)
            .text((d) => `${d.name}@${d.version}`);
        // Update simulation
        this.simulation
            .nodes(nodes)
            .on('tick', () => {
            link.attr('d', (d) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`);
            node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
        });
        this.simulation.force('link')?.links(links);
    }
    getNodeClass(node) {
        if (node.duplicateOf)
            return 'duplicate';
        if (node.size && node.size > 500000)
            return 'large';
        if (node.outdated)
            return 'outdated';
        return 'direct';
    }
    hierarchyToNodes(root, nodes = [], parent = null) {
        const node = {
            id: `${root.name}@${root.version}`,
            ...root
        };
        nodes.push(node);
        Object.values(root.dependencies || {}).forEach(dep => {
            this.hierarchyToNodes(dep, nodes, node);
        });
        return nodes;
    }
    hierarchyToLinks(nodes) {
        const links = [];
        nodes.forEach(node => {
            Object.values(node.dependencies || {}).forEach((dep) => {
                links.push({
                    source: node.id,
                    target: `${dep.name}@${dep.version}`
                });
            });
        });
        return links;
    }
    dragstarted(event, d) {
        if (!event.active)
            this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    dragended(event, d) {
        if (!event.active)
            this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    showPackageDetails(pkg) {
        const sidePanel = document.querySelector('.side-panel');
        const packageInfo = sidePanel?.querySelector('.package-info');
        if (packageInfo) {
            packageInfo.innerHTML = `
        <div class="package-info">
          <label>Name</label>
          <div>${pkg.name}@${pkg.version}</div>
          
          <label>License</label>
          <div>${pkg.license || 'Not specified'}</div>
          
          <label>Size</label>
          <div>${pkg.size ? this.formatSize(pkg.size) : 'Unknown'}</div>
          
          <label>Status</label>
          <div>${pkg.duplicateOf ? 'Duplicate' : pkg.outdated ? 'Outdated' : 'Up to date'}</div>
          
          <label>Dependencies</label>
          <div>${Object.keys(pkg.dependencies || {}).length} direct dependencies</div>
        </div>
      `;
        }
        sidePanel?.classList.add('active');
    }
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    handleSearch(query) {
        if (!query) {
            this.g.selectAll('.node').style('opacity', 1);
            return;
        }
        const lowerQuery = query.toLowerCase();
        this.g.selectAll('.node').style('opacity', (d) => d.name.toLowerCase().includes(lowerQuery) ? 1 : 0.1);
    }
    renderTreeView() {
        // Create tree layout with more spacing
        const treeLayout = d3.tree()
            .size([this.height - 40, this.width - 300]) // More horizontal space
            .separation((a, b) => (a.parent === b.parent ? 1.5 : 2)); // Increase separation between nodes
        // Convert data to hierarchy with proper structure
        const hierarchyData = {
            name: this.data.name,
            version: this.data.version,
            children: Object.entries(this.data.dependencies || {}).map(([name, dep]) => this.dependencyToHierarchy(dep))
        };
        const root = d3.hierarchy(hierarchyData);
        // Compute tree layout
        const treeData = treeLayout(root);
        // Create links
        const link = this.g.selectAll('.link')
            .data(treeData.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x));
        // Create nodes
        const node = this.g.selectAll('.node')
            .data(treeData.descendants())
            .join('g')
            .attr('class', (d) => `node ${this.getNodeClass(d.data)}`)
            .attr('transform', (d) => `translate(${d.y},${d.x})`);
        // Add circles to nodes
        node.append('circle')
            .attr('r', 4); // Smaller circles
        // Add labels to nodes with smaller font
        node.append('text')
            .attr('dy', '0.31em')
            .attr('x', 6) // Closer to circle
            .attr('class', 'tree-label')
            .style('font-size', '11px') // Smaller font
            .text((d) => `${d.data.name}@${d.data.version}`);
        // Center and scale the tree
        const bounds = this.g.node()?.getBBox();
        if (bounds) {
            const scale = Math.min((this.width - 60) / bounds.width, (this.height - 40) / bounds.height);
            const dx = (this.width - bounds.width * scale) / 2 - bounds.x * scale;
            const dy = (this.height - bounds.height * scale) / 2 - bounds.y * scale;
            this.g.attr('transform', `translate(${dx},${dy}) scale(${scale})`);
        }
        // Add hover effect for better readability
        node.on('mouseover', function () {
            d3.select(this).select('text')
                .style('font-weight', 'bold')
                .style('font-size', '12px');
        })
            .on('mouseout', function () {
            d3.select(this).select('text')
                .style('font-weight', 'normal')
                .style('font-size', '11px');
        });
    }
    dependencyToHierarchy(dep) {
        return {
            name: dep.name,
            version: dep.version,
            license: dep.license,
            size: dep.size,
            duplicateOf: dep.duplicateOf,
            outdated: dep.outdated,
            children: Object.entries(dep.dependencies || {}).map(([name, childDep]) => this.dependencyToHierarchy(childDep))
        };
    }
    renderTableView() {
        // Remove SVG if it exists
        this.svg?.remove();
        // Create container for table
        const container = d3.select('#graph')
            .append('div')
            .attr('class', 'table-container')
            .style('width', '100%')
            .style('height', '100%')
            .style('overflow', 'auto')
            .style('padding', '20px');
        // Create table
        const table = container.append('table')
            .attr('class', 'dependency-table')
            .style('width', '100%')
            .style('border-collapse', 'collapse')
            .style('background', 'var(--bg-color)')
            .style('color', 'var(--text-color)');
        // Add header
        const thead = table.append('thead');
        thead.append('tr')
            .selectAll('th')
            .data(['Package', 'Version', 'License', 'Size', 'Status'])
            .join('th')
            .text((d) => d)
            .style('padding', '12px 8px')
            .style('text-align', 'left')
            .style('border-bottom', '2px solid var(--accent-gray)')
            .style('background', 'var(--accent-gray)')
            .style('font-weight', '600');
        // Add rows
        const tbody = table.append('tbody');
        const rows = tbody.selectAll('tr')
            .data(this.flattenDependencies(this.data))
            .join('tr')
            .style('border-bottom', '1px solid var(--accent-gray)')
            .style('cursor', 'pointer')
            .on('mouseover', function () {
            d3.select(this).style('background', 'var(--accent-gray)');
        })
            .on('mouseout', function () {
            d3.select(this).style('background', null);
        });
        // Add cells
        rows.selectAll('td')
            .data((d) => [
            d.name,
            d.version,
            d.license || 'Not specified',
            d.size ? this.formatSize(d.size) : 'Unknown',
            d.duplicateOf ? 'Duplicate' : d.outdated ? 'Outdated' : 'Up to date'
        ])
            .join('td')
            .text((d) => d)
            .style('padding', '12px 8px');
        // Add click handler for package details
        rows.on('click', (event, d) => this.showPackageDetails(d));
    }
    flattenDependencies(node, result = []) {
        result.push(node);
        Object.values(node.dependencies || {}).forEach(dep => {
            this.flattenDependencies(dep, result);
        });
        return result;
    }
}
