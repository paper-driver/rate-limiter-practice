import { IsString, IsInt } from 'class-validator';

export interface CachedBuckets {
    [key: string] : Bucket
}

export enum StatusEnum {
    accepted = 'Accepted',
    rejected = 'Rejected'
}

export interface AccessDto {
    status: StatusEnum,
    availableTokens: number
}

export interface RouteStatus {
    name: string,
    burst: number,
    sustained: number,
    availableTokens: number,
    sustainRate: number
}

export class Bucket {
    @IsString()
    private name: string;

    @IsInt()
    private burst: number;

    @IsInt()
    private sustained: number;

    @IsInt()
    private availableTokens: number;

    private lastUpdate: number;

    private sustainRate: number

    constructor(name: string, burst: number, sustained: number){
        this.name = name;
        this.burst = burst;
        this.sustained = sustained;
        this.availableTokens = this.burst;
        this.sustainRate = (60/this.sustained)*1000;
        this.lastUpdate = new Date().getTime();
    }

    getBucketInfo(): RouteStatus{
        return {
            name: this.name,
            burst: this.burst,
            sustained: this.sustained,
            availableTokens: this.availableTokens,
            sustainRate: this.sustainRate
        }
    }

    grantPermissionIfAvailable(): AccessDto {
        if(this.checkBucketStatus() > 0){
            this.availableTokens -= 1;
            return {status: StatusEnum.accepted, availableTokens: this.availableTokens}
        }else{
            return {status: StatusEnum.rejected, availableTokens: this.availableTokens}
        }
    }

    checkBucketStatus(){
        const curTime = new Date().getTime();
        if(this.availableTokens < this.burst){
            //we can refill
            const proposed = Math.floor((curTime - this.lastUpdate)/this.sustainRate);
            const actual = this.burst - this.availableTokens;
            this.availableTokens += proposed > actual ? actual : proposed;
            this.lastUpdate = curTime;
        }
        return this.availableTokens;
    }
}