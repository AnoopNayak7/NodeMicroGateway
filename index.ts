import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    APIMANAGER_PORT: number;
    APIMANAGER_REFRESH_INTERVAL: number;
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    APIMANAGER_PORT: 3008,
    APIMANAGER_REFRESH_INTERVAL: 15 * 1000 * 60,
};

const envPath: string = path.join(__dirname, '/env.yaml');

try {
    if (!fs.existsSync(envPath)) {
        console.log('env.yaml - File not found');
        fs.writeFileSync(envPath, YAML.stringify(env, 4));
        console.log('env.yaml - File created');
    } else {
        const envjson: Record<string, any> = YAML.load(envPath) as Record<string, any>;
        Object.keys(envjson).forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(envjson, k)) {
                (env[k as keyof EnvConfig]as any) = envjson[k];
            }
        });
    }
} catch (err) {
    console.log('Fail to load environment variables:', err);
}

