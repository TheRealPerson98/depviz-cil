// Cross-platform script to copy UI files
import { mkdir, cp } from 'fs/promises';
import { join } from 'path';

async function copyFiles() {
  try {
    // Create the directories
    await mkdir(join('dist', 'ui', 'styles'), { recursive: true });
    await mkdir(join('dist', 'ui', 'templates'), { recursive: true });
    await mkdir(join('dist', 'ui', 'components'), { recursive: true });
    
    // Copy the files
    await cp(join('src', 'ui', 'styles'), join('dist', 'ui', 'styles'), { recursive: true });
    await cp(join('src', 'ui', 'templates'), join('dist', 'ui', 'templates'), { recursive: true });
    
    console.log('UI files copied successfully!');
  } catch (error) {
    console.error('Error copying UI files:', error);
    process.exit(1);
  }
}

copyFiles(); 