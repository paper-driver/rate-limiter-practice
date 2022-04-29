import { Module } from "@nestjs/common";
import { loadConfig, Config } from "./config";

export const CONFIG = "CONFIGURATION_INJECTION_TOKEN"

@Module({
    providers: [
        {
            provide: CONFIG,
            useFactory: async (): Promise<Config> => await loadConfig()
        }
    ],
    exports: [
        CONFIG
    ]
})
export class ConfigModule {}