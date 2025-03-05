export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
