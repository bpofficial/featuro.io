import { DeepPartial } from "../types";

export function joinArraysById<T extends { id: string }>(...lists: T[][]) {
    return Object.values(
        lists.reduce((idx, list) => {
            list.forEach((o) => {
                if (idx[o.id]) idx[o.id] = Object.assign(idx[o.id], o);
                else idx[o.id] = o;
            })
            return idx
        }, {})
    )
}

export function joinArraysByIdWithAssigner<T extends { id: string | number }>(
    assigner: (a: DeepPartial<T> | T, b: DeepPartial<T> | T) => T, 
    ...lists: DeepPartial<T>[][]
): T[] {
    return Object.values(
        lists.reduce((idx, list) => {
            list.forEach((o) => {
                if (!o.id) return;
                if (idx[o.id]) idx[o.id] = assigner(idx[o.id], o);
                else idx[o.id] = assigner(o, null);
            })
            return idx
        }, {} as Record<string | number, T>)
    )
}