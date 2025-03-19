# depviz-cli

<div align="center">

[![License: AGPL-2.0](https://img.shields.io/badge/License-AGPL%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TheRealPerson98/depviz-cil/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/TheRealPerson98/depviz-cil.svg)](https://github.com/TheRealPerson98/depviz-cil/issues)

</div>

> ⚠️ **WARNING: WORK IN PROGRESS - NOT 100% READY, USE AT YOUR OWN RISK** ⚠️
>
> This project is under active development and may contain bugs or incomplete features.
> Feel free to try it out, but be aware that some functionality might not work as expected.

---

A powerful command-line tool for visualizing and analyzing npm dependencies in your Node.js projects.

<div align="center">
  <img src="docs/assets/preview.gif" alt="depviz-cli preview" width="800px">
</div>

## ✨ Features

- 📊 **Interactive Visualization**
  - Force-directed graph layout
  - Hierarchical tree view
  - Tabular data view
  
- 🔍 **Dependency Analysis**
  - Detect duplicate dependencies
  - Identify circular dependencies
  - Track dependency sizes
  
- 📝 **Package Information**
  - License information
  - Version tracking
  - Outdated package detection
  
- 🌐 **Web Interface**
  - Real-time visualization
  - Interactive node manipulation
  - Search and filter capabilities

## 🚀 Quick Start

### Installation

```bash
# Global installation
npm install -g depviz-cli

# Or run directly with npx
npx depviz-cli
```

### Basic Usage

```bash
# Launch the tool
depviz

# Analyze a specific package
depviz analyze <package-name>
```

## 🎮 Interactive Mode

When you run `depviz`, you'll be presented with an interactive menu offering the following options:

| Option | Description |
|--------|-------------|
| 🔍 Duplicates | Find and list duplicate dependencies |
| 📦 Package Sizes | Analyze and display package sizes |
| 📝 Licenses | Show license information for all packages |
| 🔄 Updates | Check for outdated packages |
| 🌐 Visualize | Open the web visualization interface |

## 🖥️ Web Visualization

The web interface provides three different views of your dependency graph:

### 1. Force-Directed Graph
- Drag nodes to rearrange
- Zoom with mouse wheel
- Pan by dragging the background
- Hover for quick info
- Click for detailed package view

### 2. Tree View
- Hierarchical representation
- Collapsible branches
- Clear parent-child relationships
- Easy to follow dependency chains

### 3. Table View
- Sortable columns
- Quick filtering
- Comprehensive package details
- Export capabilities

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/TheRealPerson98/depviz-cil.git
cd depviz-cil

# Install dependencies
npm install

# Build the project
npm run build

# Start in development mode
npm run dev
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the AGPL-2.0 License. See [`LICENSE`](LICENSE) for more information.

## 🔗 Links

- [GitHub Repository](https://github.com/TheRealPerson98/depviz-cil)
- [Issue Tracker](https://github.com/TheRealPerson98/depviz-cil/issues)
- [Project Wiki](https://github.com/TheRealPerson98/depviz-cil/wiki)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/TheRealPerson98">TheRealPerson98</a></sub>
</div> 