import { Bucket } from "src/model/app.model";
import * as fs from 'fs';
import * as util from 'util'

const readFileAsync = util.promisify(fs.readFile)

export interface Config {
    routes: RouteConfig,
    cache: {
        size: number,
        ttl: number //seconds
    }
}

export interface RouteConfig {
   [key: string] : {
       burst: number,
       sustained: number
   }
}

export async function loadConfig(): Promise<Config> {
    const rawConfig = await readFileAsync('./src/config.json', {encoding: 'utf-8'});
    const parsedConfig = JSON.parse(rawConfig);
    return {
        cache: {
            size: parsedConfig.cacheSize,
            ttl: parsedConfig.ttl
        },
        routes: parsedConfig['routes'].reduce((r, o) => {
            r[o.endpoint] = {
                burst: o.burst,
                sustained: o.sustained
            };
            return r;
        }, {})
    }
}