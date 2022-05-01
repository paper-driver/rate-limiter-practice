import { Bucket, StatusEnum, AccessDto } from "./app.model";

describe('Bucket', () => {
    let bucket: Bucket;

    const sleep = (time) => {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    beforeEach(() => {
        bucket = new Bucket('GET mock/api', 3, 60);
    })

    afterEach(() => {
        bucket = null; //reset
    })

    it('should return bucket info', () => {
        expect(bucket.getBucketInfo()).toEqual({
            name: 'GET mock/api',
            burst: 3,
            sustained: 60,
            availableTokens: 3,
            sustainRate: 1000
        })
    })

    it('should grant the access', () => {
        expect(bucket.grantPermissionIfAvailable()).toEqual({
            status: StatusEnum.accepted,
            availableTokens: 2
        })
    })

    it('should reject the access', async () => {
        const requests = [1, 2, 3, 4].map(() => {
            return new Promise(resolve => resolve(bucket.grantPermissionIfAvailable()))
        });

        const responses = await Promise.all(requests);
        
        expect((responses[3] as AccessDto).status).toEqual(StatusEnum.rejected);
        expect((responses[3] as AccessDto).availableTokens).toEqual(0);
    })

    it('should grant the access after token is refilled', async () => {
        const requests = [1, 2, 3, 4].map(() => {
            return new Promise(resolve => resolve(bucket.grantPermissionIfAvailable()))
        });

        const responses = await Promise.all(requests);

        expect((responses[3] as AccessDto).status).toEqual(StatusEnum.rejected);
        expect((responses[3] as AccessDto).availableTokens).toEqual(0);

        await sleep(2000) //wait 2 second, refill 2 tokens 

        const response = bucket.grantPermissionIfAvailable();

        expect(response.status).toEqual(StatusEnum.accepted);
        expect(response.availableTokens).toEqual(1);
    })
})