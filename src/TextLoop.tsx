import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  Children,
} from "react";
import { TransitionMotion, spring } from "react-motion-ts";
import type { OpaqueConfig, TransitionStyle } from "react-motion-ts";
import cxs from "cxs";
import { isEqual } from "./isEqual";
import { requestTimeout, clearRequestTimeout, RequestTimeout } from "./utils";

type Props = {
  children: ReactNode[];
  interval: number | number[];
  delay: number;
  adjustingSpeed: number;
  springConfig: {
    stiffness: number;
    damping: number;
  };
  fade: boolean;
  mask: boolean;
  noWrap: boolean;
  className?: string;
  onChange?: Function;
};

const TextLoop: React.FC<Props> = ({
  interval = 3000,
  delay = 0,
  adjustingSpeed = 150,
  springConfig = { stiffness: 340, damping: 30 },
  fade = true,
  mask = false,
  noWrap = true,
  className = "",
  onChange,
  children,
}: Props) => {
  const [elements, setElements] = useState<ReactNode[]>(
    Children.toArray(children)
  );
  const [currentEl, setCurrentEl] = useState<ReactNode>(elements[0] ?? null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [currentInterval, setCurrentInterval] = useState<number>(
    Array.isArray(interval) ? interval[0] : interval
  );

  const isUnMounting = useRef<boolean>(false);
  const tickDelay = useRef<RequestTimeout>(0);
  const tickLoop = useRef<RequestTimeout>(0);
  const wordBox = useRef<HTMLDivElement | null>(null);

  const clearTimeouts = () => {
    if (tickLoop.current != null) {
      clearRequestTimeout(tickLoop.current);
    }

    if (tickDelay.current != null) {
      clearRequestTimeout(tickDelay.current);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tick = (): void => {
    if (!isUnMounting.current) {
      const newCurrentWordIndex = (currentWordIndex + 1) % elements.length;

      const newCurrentEl = elements[newCurrentWordIndex];
      const newUpdatedState = {
        currentWordIndex: newCurrentWordIndex,
        currentEl: newCurrentEl,
        wordCount: (wordCount + 1) % 1000, // just a safe value to avoid infinite counts,
        currentInterval: Array.isArray(interval)
          ? interval[newCurrentWordIndex % interval.length]
          : interval,
      };
      if (onChange) {
        onChange(newUpdatedState);
      }
      setCurrentWordIndex(newCurrentWordIndex);
      setCurrentEl(newCurrentEl);
      setWordCount(newUpdatedState.wordCount);
      setCurrentInterval(newUpdatedState.currentInterval);
    }
  };

  const getOpacity = (): 0 | 1 => (fade ? 0 : 1);

  const getDimensions = (): ClientRect | DOMRect | { width: 0; height: 0 } => {
    if (wordBox.current == null) {
      return {
        width: 0,
        height: 0,
      };
    }

    return wordBox.current.getBoundingClientRect();
  };

  // Fade out animation
  const willLeave = (): { opacity: OpaqueConfig; translate: OpaqueConfig } => {
    const { height } = getDimensions();

    return {
      opacity: spring(getOpacity(), springConfig),
      translate: spring(-height, springConfig),
    };
  };

  // Fade in animation
  const willEnter = (): { opacity: 0 | 1; translate: number } => {
    const { height } = getDimensions();

    return {
      opacity: getOpacity(),
      translate: height,
    };
  };

  const wrapperStyles = cxs({
    ...(mask && { overflow: "hidden" }),
    ...{
      display: "inline-block",
      position: "relative",
      verticalAlign: "top",
    },
  });

  const elementStyles = cxs({
    display: "inline-block",
    left: 0,
    top: 0,
    whiteSpace: noWrap ? "nowrap" : "normal",
  });

  const getTransitionMotionStyles = (): TransitionStyle[] => {
    return [
      {
        key: `step-${wordCount}`,
        data: {
          currentEl,
        },
        style: {
          opacity: spring(1, springConfig),
          translate: spring(0, springConfig),
        },
      },
    ];
  };

  useEffect(() => {
    // Starts animation
    if (currentInterval > 0 && elements.length > 1) {
      tickDelay.current = requestTimeout(() => {
        tickLoop.current = requestTimeout(tick, currentInterval);
      }, delay);
    }

    return () => {
      isUnMounting.current = true;
      clearTimeouts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newInterval = Array.isArray(interval)
      ? interval[currentWordIndex % interval.length]
      : interval;

    if (currentInterval !== newInterval) {
      clearTimeouts();

      if (newInterval > 0 && React.Children.count(children) > 1) {
        tickDelay.current = requestTimeout(() => {
          tickLoop.current = requestTimeout(tick, newInterval);
        }, delay);
      } else {
        setCurrentInterval(newInterval);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, interval]);

  useEffect(() => {
    if (!isEqual(children, elements)) {
      setElements(React.Children.toArray(children));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    if (currentInterval > 0) {
      clearTimeouts();
      tickLoop.current = requestTimeout(tick, currentInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex]);

  return (
    <div className={`${wrapperStyles} ${className}`}>
      <TransitionMotion
        willLeave={willLeave}
        willEnter={willEnter}
        styles={getTransitionMotionStyles}
      >
        {(interpolatedStyles): JSX.Element => {
          const { height, width } = getDimensions();
          return (
            <div
              style={{
                transition: `width ${adjustingSpeed}ms linear`,
                height: wordBox.current == null ? "auto" : height,
                width: wordBox.current == null ? "auto" : width,
              }}
            >
              {interpolatedStyles.map((config) => (
                <div
                  className={elementStyles}
                  ref={(n: HTMLDivElement): void => {
                    wordBox.current = n;
                  }}
                  key={config.key}
                  style={{
                    opacity: config.style.opacity,
                    transform: `translateY(${config.style.translate}px)`,
                    position: wordBox.current == null ? "relative" : "absolute",
                  }}
                >
                  {config.data.currentEl}
                </div>
              ))}
            </div>
          );
        }}
      </TransitionMotion>
    </div>
  );
};

export default TextLoop;
