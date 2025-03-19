import express from 'express';
import open from 'open';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DependencyNode } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WebUI {
  private app: express.Application;
  private port: number;

  constructor(private graph: DependencyNode) {
    this.app = express();
    this.port = 3000;
    this.setupRoutes();
  }

  private setupRoutes() {
    // Serve static files - handle both dev and prod paths
    const uiPath = join(__dirname, '..', 'ui');
    const prodUiPath = join(__dirname, '..', '..', 'dist', 'ui');
    
    // Try prod path first, fall back to dev path
    this.app.use('/styles', express.static(join(prodUiPath, 'styles')));
    this.app.use('/styles', express.static(join(uiPath, 'styles')));
    
    this.app.use('/components', express.static(join(prodUiPath, 'components')));
    this.app.use('/components', express.static(join(uiPath, 'components')));

    this.app.get('/', async (_, res) => {
      try {
        // Try to read from prod path first, fall back to dev path
        let templatePath = join(prodUiPath, 'templates', 'index.html');
        try {
          await readFile(templatePath, 'utf-8');
        } catch {
          templatePath = join(uiPath, 'templates', 'index.html');
        }

        let html = await readFile(templatePath, 'utf-8');
        const d3Data = this.convertToD3Format(this.graph);
        html = html.replace(/GRAPH_DATA_PLACEHOLDER/g, JSON.stringify(d3Data));
        
        res.send(html);
      } catch (error) {
        res.status(500).send(`Error: ${(error as Error).message}`);
      }
    });
  }

  private convertToD3Format(node: DependencyNode): any {
    return {
      name: node.name,
      version: node.version,
      license: node.license,
      isDevDependency: node.isDevDependency,
      duplicateOf: node.duplicateOf,
      dependencies: Object.fromEntries(
        Object.entries(node.dependencies).map(([name, dep]) => [
          name,
          this.convertToD3Format(dep)
        ])
      )
    };
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      const server = this.app.listen(this.port, () => {
        console.log(`Web visualization available at http://localhost:${this.port}`);
        open(`http://localhost:${this.port}`);
        resolve();
      }).on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${this.port} is already in use, trying a different port...`);
          // Try a random port
          const randomPort = Math.floor(3001 + Math.random() * 2000);
          this.port = randomPort;
          server.close();
          this.app.listen(randomPort, () => {
            console.log(`Web visualization available at http://localhost:${randomPort}`);
            open(`http://localhost:${randomPort}`);
            resolve();
          });
        } else {
          console.error('Failed to start web server:', err.message);
          process.exit(1);
        }
      });
    });
  }
}

export async function startWebServer(graph: DependencyNode): Promise<void> {
  const ui = new WebUI(graph);
  await ui.start();
} 