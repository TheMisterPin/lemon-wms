/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BasicResponse {
    success: boolean;
    message?: string;
    data : any;
    error? : any;
    code?: number;
}
