import { app, ipcMain } from 'electron';
import { Ollama } from 'ollama';
import { execFile, ChildProcess } from 'child_process';
import fs from 'fs';
import { sendOllamaStatusToRenderer } from '../main';
import { PROMPT } from './prompts';

// events
import { IpcMainChannel } from './events';
import {
  createDirectoryElevated,
  executeCommandElevated,
  getExecutablePathByPlatform,
  killProcess,
  runDelayed,
} from './system';

// storage
import { getModelPathFromStorage } from './storage';
import { logger } from './logger';
const TAG = ' | ollama | '
// constants
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';

// commands
export const SERVE_OLLAMA_CMD = 'ollama serve';
export const WSL_SERVE_OLLAMA_CMD = 'wsl ollama serve';

// ollama instance
let ollama: Ollama;
let ollamaProcess: ChildProcess | null;

export const loadOllama = async () => {
  let tag = TAG + " | loadOllama | "
  try{
    let runningInstance = await isOllamaInstanceRunning();
    console.log(tag,'runningInstance:',runningInstance)
    if (runningInstance) {
      // connect to local instance
      ollama = new Ollama({
        host: DEFAULT_OLLAMA_URL,
      });

      await sendOllamaStatusToRenderer(
          `local instance of ollama is running and connected at ${DEFAULT_OLLAMA_URL}`,
      );
      console.log(tag,'local instance of ollama is running and connected at',DEFAULT_OLLAMA_URL)
      return true;
    }

    const customAppData = getModelPathFromStorage();
    runningInstance = await packedExecutableOllamaSpawn(customAppData);

    if (runningInstance) {
      // connect to local instance
      ollama = new Ollama({
        host: DEFAULT_OLLAMA_URL,
      });

      await sendOllamaStatusToRenderer(
          `local instance of ollama is running and connected at ${DEFAULT_OLLAMA_URL}`,
      );

      return true;
    }

    ipcMain.emit(IpcMainChannel.Error, `Couldn't start Ollama locally.`);

    return false;  
  }catch(e){
    console.error(tag,e)
  }
};

export const isOllamaInstanceRunning = async (url?: string): Promise<boolean> => {
  try {
    const usedUrl = url ?? DEFAULT_OLLAMA_URL;

    await sendOllamaStatusToRenderer(`checking if ollama instance is running at ${usedUrl}`);

    const ping = await fetch(usedUrl);

    return ping.status === 200;
  } catch (err) {
    return false;
  }
};

export const packedExecutableOllamaSpawn = async (customDataPath?: string) => {
  let tag = TAG + " | packedExecutableOllamaSpawn | "
  try {
    console.log(tag,'customDataPath:', customDataPath)
    await sendOllamaStatusToRenderer(`trying to spawn locally installed ollama`);
    spawnLocalExecutable(customDataPath);
  } catch (err) {
    console.error(err);
  }

  return await runDelayed(isOllamaInstanceRunning, 10000);
};

export const devRunLocalWSLOllama = (customDataPath?: string) => {
  executeCommandElevated(
    WSL_SERVE_OLLAMA_CMD,
    customDataPath ? { OLLAMA_MODELS: customDataPath } : undefined,
  );
};

export const spawnLocalExecutable = async (customDataPath?: string) => {
  let tag = TAG + " | spawnLocalExecutable | "
  try {
    console.log(tag,'customDataPath:', customDataPath)
    const { executablePath, appDataPath } = await getOllamaExecutableAndAppDataPath(customDataPath);
    console.log(tag,'appDataPath:', appDataPath)
    if (!fs.existsSync(appDataPath)) {
      console.log(tag,'No app data path found, creating one')
      createDirectoryElevated(appDataPath);
    }

    const env = {
      ...process.env,
      OLLAMA_MODELS: appDataPath,
    };
    console.log(tag,'env:', env)
    ollamaProcess = execFile(executablePath, ['serve'], { env }, (err, stdout, stderr) => {
      if (err) {
        console.error(tag,'err:', err)
        throw new Error(`exec error: ${err.message}`);
      }

      if (stderr) {
        console.error(tag,'stderr:', stderr)
        throw new Error(`stderr: ${stderr}`);
      }
    });
  } catch (err) {
    logger.error(err);
  }
};

export const getOllamaExecutableAndAppDataPath = async (
    customDataPath?: string,
): Promise<{
  executablePath: string;
  appDataPath: string;
}> => {
  const appDataPath = customDataPath || app.getPath('userData');
  const executablePath = await getExecutablePathByPlatform(); // This line is corrected

  return {
    executablePath,
    appDataPath,
  };
};

export const askOllama = async (model: string, message: string) => {
  return await ollama.chat({
    model,
    messages: [
      {
        role: 'system',
        content: PROMPT,
      },
      {
        role: 'user',
        content: `Answer the following query in a valid formatted JSON object without comments with both the response and action fields deduced from the user's question. Adhere strictly to JSON syntax without comments. Query: ${message}. Response: { "response":`,
      },
    ],
  });
};

export const getOrPullModel = async (model: string) => {
  await installModelWithStatus(model);

  // init the model on pull to load into memory
  await ollama.chat({ model });

  return findModel(model);
};

export const installModelWithStatus = async (model: string) => {
  const stream = await ollama.pull({
    model,
    stream: true,
  });

  for await (const part of stream) {
    if (part.digest) {
      let percent = 0;

      if (part.completed && part.total) {
        percent = Math.round((part.completed / part.total) * 100);

        await sendOllamaStatusToRenderer(`${part.status} ${percent}%`);
      }
    } else {
      await sendOllamaStatusToRenderer(`${part.status}`);
    }
  }
};

export const findModel = async (model: string) => {
  const allModels = await ollama.list();

  return allModels.models.find((m) => m.name.toLowerCase().includes(model));
};

export const getAllLocalModels = async () => {
  return await ollama.list();
};

export const stopOllama = async () => {
  if (!ollamaProcess) {
    return;
  }

  killProcess(ollamaProcess);

  ollamaProcess.removeAllListeners();
  ollamaProcess = null;
};
