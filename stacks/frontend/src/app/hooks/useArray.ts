import { useState } from "react";

export const useArray = <T>(initialValue: T[] = []) => {
    const [value, setValue] = useState<T[]>(initialValue);
  
    const push = (element: T) => {
        setValue(oldValue => [...oldValue, element]);
    };
  
    const remove = (index: number) => {
        setValue(oldValue => oldValue.filter((_, i) => i !== index));
    };

    const concat = (eles: T[]) => {
        setValue(v => v.concat(eles));
    }

    const update = (index: number, update: T) => {
        setValue(d => {
            d[index] = update;
            return [...d];
        });
    }
  
    const isEmpty = () => value.length === 0;
  
    return { value, setValue, push, remove, concat, update, isEmpty };
};    