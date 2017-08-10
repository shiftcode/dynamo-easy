import { AttributeValue } from 'aws-sdk/clients/dynamodb';

export type AttributeMap<T> = {[key in keyof T]: AttributeValue};
