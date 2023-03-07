import React, { useEffect, useState } from "react";

export const useCopyOnClick = () => {
    const [shownTooltip, setState] = useState<null | string>(null);

    const onClickCopy = (val: string, ref?: any) => () => {
        console.log(ref.current);
        navigator.clipboard.writeText(val);
        setState(val);
    }

    useEffect(() => {
        if (shownTooltip !== null) {
            setTimeout(() => {
                setState(null);
            }, 1500);
        }
    }, [shownTooltip])

    return { 
        onClickCopy,
        shownTooltip
    }
}