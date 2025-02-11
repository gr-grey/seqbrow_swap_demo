import { useState, useRef, useEffect, useCallback } from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css';
import './App.css'
import Plot from 'react-plotly.js';
import throttle from 'lodash/throttle'

function App() {

  const [plot1Zindex, setPlot1Zindex] = useState(2)
  const [plot2Zindex, setPlot2Zindex] = useState(1)

  const range = (start, stop, step = 1) =>
    Array.from(
      { length: Math.ceil((stop - start) / step) },
      (_, i) => start + i * step,
    );

  const seqLen = 600
  const plot2Start = 400
  const x1 = range(0, seqLen)
  const x2 = range(plot2Start, plot2Start + seqLen)

  const y1 = range(0, 400).map((x) => Math.sin(Math.PI / 10 * x)).concat(
    range(400, 600).map((x) => x / 600)
  )
  const y2 = range(400, 600).map((x) => x / 600).concat(range(600, 1000).map((x) => Math.sin(Math.PI / 10 * x)))

  const plotData1 = [
    {
      x: x1,
      y: y1,
      mode: 'lines',
      line: { color: 'green' }
    },
  ]

  const plotData2 = [
    {
      x: x2,
      y: y2,
      mode: 'lines',
      line: { color: 'red' }
    },
  ]

  const plotLayout = {
    height: 500,
    width: 4800,
    margin: { l: 0, r: 0, t: 10, b: 20 }
  }

  const plot1Ref = useRef(null)
  const plot2Ref = useRef(null)

  const availableScroll = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Use full scrollable width (content width - container width)
      if (plot1Ref.current) {
        const availScroll = plot1Ref.current.scrollWidth - plot1Ref.current.clientWidth;
        // plot1Ref and 2 has same widths 
        const scrollableCoords = availScroll / plot1Ref.current.scrollWidth * seqLen
        const leftCoord = Math.floor(scrollableCoords * 0.9)
        const box2ScrollPercent = (leftCoord - plot2Start) / scrollableCoords

        plot1Ref.current.scrollLeft = availScroll * 0.5
        plot2Ref.current.scrollLeft = box2ScrollPercent * availScroll
        availableScroll.current = availScroll
      }
    }, 50); // Short delay for layout stabilization

    return () => clearTimeout(timer);
  }, [])

  const isTransitioning = useRef(false);

  const handleScroll1 = useCallback(throttle((e) => {
    if (isTransitioning.current) return;

    const scrollLeft = e.target.scrollLeft;
    const threshold = availableScroll.current * 0.9;

    if (scrollLeft >= threshold) {
      isTransitioning.current = true;

      // Switch visibility
      setPlot1Zindex(1);
      setPlot2Zindex(2);

      // Reset transition lock after browser repaint
      requestAnimationFrame(() => {
        isTransitioning.current = false;
      });
    }
  }, 100), [seqLen, plot2Start]);

  return (

    <div className='m-2'>
      <h1> Sequence viewer</h1>

      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1'
        onClick={() => {
          setPlot1Zindex(2)
          setPlot2Zindex(1)
        }}
      > Show plot 1</button>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
        onClick={() => {
          setPlot1Zindex(1)
          setPlot2Zindex(2)
        }}
      > Show plot 2</button>

      {/* Container for overlapping boxes */}
      <div className='relative h-[200px]'> {/* Set a fixed height for the container */}
        {/* Plot 1 - Initial position */}
        <div
          className='seqbox1 absolute top-0 left-0 w-full border-2 border-green-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
          ref={plot1Ref}
          onScroll={handleScroll1}
          style={{ zIndex: plot1Zindex }} // Brings red-bordered box to front
        >
          <Plot
            data={plotData1}
            layout={plotLayout}
          />
        </div>

        {/* Plot 2 - Overlapping position */}
        <div
          className='seqbox2 absolute top-0 left-0 w-full border-2 border-red-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
          ref={plot2Ref}
          style={{ zIndex: plot2Zindex }} // Brings red-bordered box to front
        >
          <Plot
            data={plotData2}
            layout={plotLayout}
          />
        </div>

      </div>
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-blue-500 z-10"></div>
    </div>
  )
}

// function App() {
//   const seqLen = 600
//   const [seq1Start, seq1End] = [0, 600]
//   const [seq2Start, seq2End] = [400, 1000]

//   const range = (start, stop, step = 1) =>
//     Array.from(
//       { length: Math.ceil((stop - start) / step) },
//       (_, i) => start + i * step,
//     );

//   const [seq1, setSeq1] = useState('0123456789'.repeat(seqLen/10))
//   const [seq2, setSeq2] = useState('0123456789'.repeat(seqLen/10))
//   const [seq1Zindex, setSeq1Zindex] = useState(2)
//   const [seq2Zindex, setSeq2Zindex] = useState(1)

//   const seqbox1 = useRef(null)
//   const seqbox2 = useRef(null)

//   const availableScroll = useRef(null)

//   const [tooltip1, setTooltip1] = useState(range(seq1Start, seq1End)) // [0, 600]
//   const [tooltip2, setTooltip2] = useState(range(seq2Start, seq2End)) // [500, 1100]

//   // Add background color for beginning, middle and end of sequence for debug
//   const getBackgroundColor = (index, seqLength) => {
//     if (index === Math.floor(seqLength / 2)) {
//       return "red"; // Middle character
//     } else if (index < 200) {
//       return "yellow"; // Frist 100
//     } else if (index > 400) {
//       return "green"; // Last 100
//     }
//     return "white"; // Default background
//   };

//   useEffect(()=>{
//     const timer = setTimeout(() => {
//       // Use full scrollable width (content width - container width)
//       if (seqbox1.current) {
//         const availScroll = seqbox1.current.scrollWidth - seqbox1.current.clientWidth;
//         // seqbox1 and 2 has same widths 
//         const scrollableCoords = availScroll/seqbox1.current.scrollWidth * seqLen 
//         const leftCoord = Math.floor(scrollableCoords * 0.9)
//         const box2ScrollPercent = (leftCoord - seq2Start) / scrollableCoords

//         seqbox1.current.scrollLeft = availScroll * 0.5;
//         seqbox2.current.scrollLeft = box2ScrollPercent * availScroll
//         availableScroll.current = availScroll
//       }
//     }, 50); // Short delay for layout stabilization

//     return () => clearTimeout(timer);
//   }, [])

//   const isTransitioning = useRef(false);

//   // Scroll handler for seqbox1
//   const handleScroll1 = useCallback((e) => {
//     if (isTransitioning.current) return;

//     const scrollLeft = e.target.scrollLeft;
//     const threshold = availableScroll.current * 0.9;

//     if (scrollLeft >= threshold) {
//       isTransitioning.current = true;

//       // Switch visibility
//       setSeq1Zindex(1);
//       setSeq2Zindex(2);

//       // Reset transition lock after browser repaint
//       requestAnimationFrame(() => {
//         isTransitioning.current = false;
//       });
//     }
//   }, [seqLen, seq2Start]);

//   return (
//     <div className='m-2'>
//       <h1> Sequence viewer</h1>

//       <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1'
//         onClick={() => {
//           setSeq1Zindex(2)
//           setSeq2Zindex(1)
//         }}
//       > Show seq1</button>
//       <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
//         onClick={() => {
//           setSeq1Zindex(1)
//           setSeq2Zindex(2)
//         }}
//       > Show seq2</button>

//       {/* Container for overlapping boxes */}
//       <div className='relative h-[200px]'> {/* Set a fixed height for the container */}
//         {/* SeqBox 1 - Initial position */}
//         <div
//           className='seqbox1 absolute top-0 left-0 w-full border border-gray-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
//           ref={seqbox1}
//           onScroll={handleScroll1}
//           style={{ zIndex: seq1Zindex}} // Brings red-bordered box to front
//         >
//           {seq1.split("").map((char, index) => (
//             <Tippy content={tooltip1[index]} key={index}>
//               <span style={{ backgroundColor: getBackgroundColor(index, seq1.length) }}>{char}</span>
//             </Tippy>
//           ))}
//         </div>

//         {/* SeqBox 2 - Overlapping position */}
//         <div
//           className='seqbox2 absolute top-0 left-0 w-full border-2 border-red-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
//           ref={seqbox2}
//           style={{ zIndex: seq2Zindex }} // Brings red-bordered box to front
//         >
//           {seq2.split("").map((char, index) => (
//             <Tippy content={tooltip2[index]} key={index}>
//               <span style={{ backgroundColor: getBackgroundColor(index, seq2.length) }} >
//                 {char}</span>
//             </Tippy>
//           ))}
//         </div>
//         <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-blue-500 z-10"></div>
//       </div>
//     </div>
//   )
// }

export default App