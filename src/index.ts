#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { analyzeProject } from './core/analyzer.js';
import { startWebServer } from './server/WebUI.js';
import type { AnalysisOptions } from './core/types.js';

async function main() {
  console.log(chalk.cyan('\n📦 depviz - NPM Dependency Analyzer\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'analysisType',
      message: 'How would you like to analyze?',
      choices: [
        { name: '✨ Show everything', value: 'all' },
        { name: '🎯 Select specific features', value: 'custom' }
      ]
    }
  ]);

  let selectedFeatures: string[] = [];

  if (answers.analysisType === 'custom') {
    const featureAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select the features you want to analyze:',
        choices: [
          { name: '🔍 Show duplicate dependencies', value: 'duplicates' },
          { name: '📦 Show package sizes', value: 'size' },
          { name: '📝 Show license information', value: 'licenses' },
          { name: '🔄 Check for outdated packages', value: 'outdated' }
        ]
      }
    ]);
    selectedFeatures = featureAnswers.features;
  } else {
    selectedFeatures = ['duplicates', 'size', 'licenses', 'outdated'];
  }

  const options: AnalysisOptions = {
    showDuplicates: selectedFeatures.includes('duplicates'),
    showSize: selectedFeatures.includes('size'),
    showLicenses: selectedFeatures.includes('licenses'),
    showOutdated: selectedFeatures.includes('outdated'),
    webView: true // Always true now
  };

  const spinner = ora('Analyzing dependencies...').start();
  
  try {
    const graph = await analyzeProject(options);
    spinner.succeed('Analysis complete');

    spinner.start('Starting web visualization...');
    await startWebServer(graph);
    spinner.succeed('Web visualization ready');
  } catch (error) {
    spinner.fail('Analysis failed');
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red('An unknown error occurred'));
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 