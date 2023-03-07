import React, { createContext, useContext } from "react";
import { useArray } from "../../../../hooks";

interface Condition {
    conditions?: Omit<Condition, 'conditions'>[];
}

interface ConditionContext {
    state: Condition[];
    update: ReturnType<typeof useArray>['update'];
    push: ReturnType<typeof useArray>['push'];
    remove: ReturnType<typeof useArray>['remove'];
}

const ConditionContext = createContext<ConditionContext>({
    state: [],
    update: () => {
        // nothing...
    },
    push: () => {
        // nothing...
    },
    remove: () => {
        // nothing...
    },
});

export function useConditionContext() {
    return useContext(ConditionContext);
}

export const ConditionContextConsumer = ConditionContext.Consumer;

export const ConditionContextProvider = ({ children }) => {
    const { value: state, update, remove, push } = useArray<Condition>([]);

    return (
        <ConditionContext.Provider value={{ state, push, update, remove }}>
            {children}
        </ConditionContext.Provider>
    )
}