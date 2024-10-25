import checkDiskSpace from 'check-disk-space';
import path from 'path';
import os from 'os';
import sudo from 'sudo-prompt';
import { ChildProcess } from 'child_process';
import { isDev, appPath } from './../main';
import { logger } from './logger';
import fs from 'fs';
const TAG = ' | system | ';
export const getDiskSpaceInformation = async (url: string) => {
  const diskSpace = await checkDiskSpace(url);
  logger.log({
    level: 'info',
    message: `Disk space information for ${url}: ${JSON.stringify(diskSpace)}`
  });
  return diskSpace;
};

export const hasEnoughSpace = async (url: string, sizeInBytes: number) => {
  const diskSpace = await getDiskSpaceInformation(url);
  const hasSpace = diskSpace.free > sizeInBytes;
  logger.log({
    level: 'info',
    message: `Checking if there is enough space. Required: ${sizeInBytes}, Available: ${diskSpace.free}, Has enough: ${hasSpace}`
  });
  return hasSpace;
};

export const executeCommandElevated = (command: string, envOptions?: { OLLAMA_MODELS: string }) => {
  const options = {
    name: 'Ollama',
    icns: path.join(__dirname, '..', 'logo_white.ico'),
    ...(envOptions && { ...envOptions }),
  };

  logger.log({
    level: 'info',
    message: `Executing elevated command: ${command} with options: ${JSON.stringify(options)}`
  });

  sudo.exec(command, options, (error: any, stdout: any, stderr: any) => {
    if (error) {
      logger.error(`Error executing command: ${error}`);
      throw error;
    }

    if (stderr) {
      logger.error(`Stderr from command: ${stderr}`);
      throw stderr;
    }

    logger.log({
      level: 'info',
      message: `Command output: ${stdout}`
    });
  });
};

export const createDirectoryElevated = (dirPath: string) => {
  const options = {
    name: 'Ollama',
    icns: path.join(__dirname, '..', 'logo_white.ico'),
  };

  const command = `mkdir ${dirPath}${process.platform !== 'win32' ? ' -p' : ''}`;

  logger.log({
    level: 'info',
    message: `Creating directory with command: ${command}`
  });

  sudo.exec(command, options, (error: any, stdout: any, stderr: any) => {
    if (error) {
      logger.error(`Error creating directory: ${error}`);
      throw error;
    }

    if (stderr) {
      logger.error(`Stderr from directory creation: ${stderr}`);
      throw stderr;
    }

    logger.log({
      level: 'info',
      message: `Directory creation output: ${stdout}`
    });
  });
};

export const killProcess = (process: ChildProcess) => {
  if (os.platform() === 'win32') {
    const options = {
      name: 'Ollama',
      icns: path.join(__dirname, '..', 'logo_white.ico'),
    };

    const command = `taskkill /pid ${process.pid} /f /t`;
    logger.log({
      level: 'info',
      message: `Killing process with command: ${command}`
    });

    sudo.exec(command, options, (err) => {
      if (err) {
        logger.error(`Error killing process: ${err}`);
      }
    });
  } else {
    logger.log({
      level: 'info',
      message: `Killing process with PID: ${process.pid}`
    });
    process.kill();
  }
};

export const runDelayed = async <T>(handler: () => Promise<T>, delayInMs = 3000) => {
  logger.log({
    level: 'info',
    message: `Running handler after delay of ${delayInMs} ms`
  });
  return new Promise((resolve) => setTimeout(resolve, delayInMs)).then(async () => await handler());
};

export const getDefaultAppDataPathByPlatform = () => {
  const homeDir = os.homedir();
  let appDataPath;

  switch (process.platform) {
    case 'win32':
      appDataPath = path.join(homeDir, 'AppData', 'Local', 'Ollama', 'SubMod');
      break;
    case 'darwin':
      appDataPath = path.join(homeDir, 'Library', 'Application Support', 'Ollama', 'SubMod');
      break;
    case 'linux':
      appDataPath = path.join(homeDir, '.config', 'Ollama', 'SubMod');
      break;
    default:
      const error = `Unsupported platform detected: ${process.platform}`;
      logger.error(error);
      throw new Error(error);
  }

  logger.log({
    level: 'info',
    message: `Default app data path: ${appDataPath}`
  });

  return appDataPath;
};

export const getExecutablePathByPlatform = async () => {
  let tag = TAG + ' | getExecutablePathByPlatform | ';
  let executablePath;
  //    const dirPath = path.join(__dirname, 'executables')
  
  switch (process.platform) {
    case 'win32':
      executablePath = isDev
          ? path.join(__dirname, 'executables', 'ollama.exe')
          : path.join(__dirname, 'executables', 'ollama.exe');
      break;
    case 'darwin':
      executablePath = isDev
          ? path.join(__dirname, 'executables', 'ollama-darwin')
          : path.join(__dirname, 'executables', 'ollama-darwin');
      break;
    case 'linux':
      executablePath = isDev
          ? path.join(__dirname, 'executables', 'ollama-linux')
          : path.join(__dirname, 'executables', 'ollama-linux');
      break;
    default:
      const error = `Unsupported platform detected: ${process.platform}`;
      logger.error(error);
      throw new Error(error);
  }

  logger.log({
    level: 'info',
    message: `Executable path: ${executablePath}`
  });

  // Read and log directory contents to help debug path issues
  try {
    console.log(tag,'executablePath: ',executablePath)
  } catch (err) {
    logger.error(`Error reading directory contents at path: ${path.dirname(executablePath)} - ${err}`);
  }

  // Check if the executable exists
  if (!fs.existsSync(executablePath)) {
    const error = `Executable not found at path: ${executablePath}`;
    logger.error(error);
    throw new Error(error);
  }

  return executablePath;
};
