export interface DependencyNode {
  name: string;
  version: string;
  dependencies: Record<string, DependencyNode>;
  size?: number;
  license?: string;
  isDevDependency?: boolean;
  duplicateOf?: string;
  outdated?: boolean;
}

export interface AnalysisOptions {
  showDuplicates?: boolean;
  showSize?: boolean;
  showLicenses?: boolean;
  showOutdated?: boolean;
  webView?: boolean;
}

export interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  license?: string;
} 