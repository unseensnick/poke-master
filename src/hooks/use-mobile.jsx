import * as React from "react";

/**
 * Mobile breakpoint in pixels for responsive design
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook for detecting mobile viewport with MediaQuery listener
 * @returns {boolean} True when viewport width < 768px
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(undefined);

    React.useEffect(() => {
        const mql = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        );
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return !!isMobile;
}
