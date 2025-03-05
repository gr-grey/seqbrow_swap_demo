import React, { useState, useEffect, useRef, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import Plot from 'react-plotly.js';
import throttle from 'lodash/throttle'

// Generate a sequence of numbers (like Python range)
const range = (start, stop, step = 1) =>
  Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);

// Generate sine wave plot data
const getPlotData = (index) => {
  const trace_idx = range(1, 40)
  let traces = []

  const xs = range(index * 2000, (index + 1) * 2000);

  trace_idx.forEach(idx => {
    const ys = xs.map(x => Math.sin(x * Math.PI / 64 * (1 + idx / 10)) + Math.cos(idx))

    traces.push({ x: xs, y: ys, type: 'line', line: { color: `hsl(${idx * 360 / trace_idx.length}, 80%, 50%)` } })
  });

  // const ys = xs.map((x) => Math.sin(x * Math.PI / 64));
  return traces;
};

const ITEM_WIDTH = 2000;

const plotLayout = { height: 196, width: ITEM_WIDTH, margin: { l: 0, r: 0, t: 0, b: 15 }, showlegend: false };

export default function App() {
  const listRef = useRef(null);
  const isTransitioning = useRef(false)
  const scrollInited = useRef(false)
  const initNum = 3
  const [items, setItems] = useState(range(0, initNum));

  // Scroll to the middle at init
  useEffect(() => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToItem(Math.floor(initNum), 'start');
        scrollInited.current = true
      }
    }, 10);
  }, []);

  const handleScroll = throttle(({ scrollOffset }) => {
    if (isTransitioning.current || !scrollInited.current) return;

    if (scrollOffset < ITEM_WIDTH && !isTransitioning.current) {
      isTransitioning.current = true;

      setItems((prev) =>[prev[0] - 1, ...prev] )
      listRef.current.scrollTo(scrollOffset + ITEM_WIDTH);

      setTimeout(() => {
        isTransitioning.current = false;
      }, 100);

    } else if (scrollOffset > (items.length - 2) * ITEM_WIDTH) {
      setItems((prev) => {
        if (prev[prev.length - 1] + 1 !== prev[prev.length - 1]) {
          return [...prev, prev[prev.length - 1] + 1];
        }
        return prev;
      });
    }
  }, 100); 

  const Row = ({ index, style }) => {
    const num = items[index];

    // Memoize the plot so it doesn't rerender unnecessarily
    const plot = useMemo(() => <Plot data={getPlotData(num)} layout={plotLayout} />, [num]);

    return (
      <div className="border-2 border-black relative" style={{ ...style, width: ITEM_WIDTH }}>
        {plot}
        <div className="absolute top-5 left-5 text-4xl">{num}</div>
      </div>
    );
  };

  return (
    <>
      <div>{items}</div>
      <div style={{ width: "100vw", overflow: "hidden" }}>
        <List
          layout="horizontal"
          ref={listRef}
          height={200}
          itemCount={items.length}
          itemSize={ITEM_WIDTH}
          width={window.innerWidth}
          onScroll={handleScroll}
        >
          {Row}
        </List>
      </div>
    </>
  );
}