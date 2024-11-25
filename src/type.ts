export interface BaseRes<T> {
    resultCode: string,
    resultMsg: string,
    data: T
}