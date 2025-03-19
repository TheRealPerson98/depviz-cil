import { readFile } from 'fs/promises';
import { join } from 'path';
import type { DependencyNode, AnalysisOptions, PackageInfo } from './types.js';
import { walk } from 'walk';

async function readPackageJson(path: string = 'package.json'): Promise<PackageInfo> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read package.json: ${(error as Error).message}`);
  }
}

async function getDependencySize(name: string, version: string): Promise<number> {
  try {
    const packagePath = join('node_modules', name);
    const { size } = await new Promise<{ size: number }>((resolve, reject) => {
      let totalSize = 0;
      const walker = walk(packagePath, {
        followLinks: false,
        filters: ['node_modules']
      });

      walker.on('file', (root, stats, next) => {
        totalSize += stats.size;
        next();
      });

      walker.on('end', () => {
        resolve({ size: totalSize });
      });
    });

    return size;
  } catch {
    return 0;
  }
}

async function buildDependencyTree(
  name: string,
  version: string,
  visited = new Set<string>(),
  isDevDep = false
): Promise<DependencyNode> {
  const key = `${name}@${version}`;
  const isDuplicate = visited.has(key);
  
  if (isDuplicate) {
    return {
      name,
      version,
      dependencies: {},
      duplicateOf: key,
      isDevDependency: isDevDep
    };
  }
  
  visited.add(key);
  
  try {
    const packagePath = join('node_modules', name, 'package.json');
    const packageInfo = await readPackageJson(packagePath);
    const size = await getDependencySize(name, version);
    
    const dependencies: Record<string, DependencyNode> = {};
    const deps = packageInfo.dependencies || {};
    
    for (const [depName, depVersion] of Object.entries(deps)) {
      dependencies[depName] = await buildDependencyTree(
        depName,
        depVersion.replace(/^\^|~/, ''),
        visited,
        isDevDep
      );
    }
    
    return {
      name,
      version: packageInfo.version,
      dependencies,
      license: packageInfo.license,
      size,
      isDevDependency: isDevDep
    };
  } catch (error) {
    throw new Error(`Failed to analyze dependency ${name}: ${(error as Error).message}`);
  }
}

export async function analyzeProject(options: AnalysisOptions): Promise<DependencyNode> {
  const rootPackage = await readPackageJson();
  const dependencies: Record<string, DependencyNode> = {};
  
  // Process regular dependencies
  for (const [name, version] of Object.entries(rootPackage.dependencies || {})) {
    dependencies[name] = await buildDependencyTree(name, version.replace(/^\^|~/, ''), new Set());
  }
  
  // Process dev dependencies if needed
  for (const [name, version] of Object.entries(rootPackage.devDependencies || {})) {
    dependencies[name] = await buildDependencyTree(name, version.replace(/^\^|~/, ''), new Set(), true);
  }
  
  return {
    name: rootPackage.name,
    version: rootPackage.version,
    dependencies,
    license: rootPackage.license
  };
} 