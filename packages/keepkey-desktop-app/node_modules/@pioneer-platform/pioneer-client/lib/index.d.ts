declare class Pioneer {
    queryKey: any;
    client: any;
    pioneer: any;
    spec: any;
    private timeout;
    constructor(spec: any, config: {
        queryKey: any;
        timeout: number;
    });
    init(): Promise<any>;
}
export default Pioneer;
