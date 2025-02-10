import { useState, useRef, useEffect, useCallback } from 'react'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './App.css'

function App() {
  const seqLen = 600
  const [seq1Start, seq1End] = [0, 600]
  const [seq2Start, seq2End] = [400, 1000]

  const range = (start, stop, step = 1) =>
    Array.from(
      { length: Math.ceil((stop - start) / step) },
      (_, i) => start + i * step,
    );

  const [seq1, setSeq1] = useState('A'.repeat(seqLen))
  const [seq2, setSeq2] = useState('C'.repeat(seqLen))
  const [seq1Zindex, setSeq1Zindex] = useState(2)
  const [seq2Zindex, setSeq2Zindex] = useState(1)

  const seqbox1 = useRef(null)
  const seqbox2 = useRef(null)

  const availableScroll = useRef(null)

  const [tooltip1, setTooltip1] = useState(range(seq1Start, seq1End)) // [0, 600]
  const [tooltip2, setTooltip2] = useState(range(seq2Start, seq2End)) // [500, 1100]

  // Add background color for beginning, middle and end of sequence for debug
  const getBackgroundColor = (index, seqLength) => {
    if (index === Math.floor(seqLength / 2)) {
      return "red"; // Middle character
    } else if (index < 200) {
      return "yellow"; // Frist 100
    } else if (index > 400) {
      return "green"; // Last 100
    }
    return "white"; // Default background
  };

  useEffect(()=>{
    const timer = setTimeout(() => {
      // Use full scrollable width (content width - container width)
      if (seqbox1.current) {
        const availScroll = seqbox1.current.scrollWidth - seqbox1.current.clientWidth;
        // seqbox1 and 2 has same widths 
        const scrollableCoords = availScroll/seqbox1.current.scrollWidth * seqLen 
        const leftCoord = Math.floor(scrollableCoords * 0.9)
        const box2ScrollPercent = (leftCoord - seq2Start) / scrollableCoords
        
        seqbox1.current.scrollLeft = availScroll * 0.5;
        seqbox2.current.scrollLeft = box2ScrollPercent * availScroll
        availableScroll.current = availScroll
      }
    }, 50); // Short delay for layout stabilization
  
    return () => clearTimeout(timer);
  }, [])

  const isTransitioning = useRef(false);

  // Scroll handler for seqbox1
  const handleScroll1 = useCallback((e) => {
    if (isTransitioning.current) return;
    
    const scrollLeft = e.target.scrollLeft;
    const threshold = availableScroll.current * 0.9;

    if (scrollLeft >= threshold) {
      isTransitioning.current = true;
      
      // Switch visibility
      setSeq1Zindex(1);
      setSeq2Zindex(2);

      // Reset transition lock after browser repaint
      requestAnimationFrame(() => {
        isTransitioning.current = false;
      });
    }
  }, [seqLen, seq2Start]);

  return (
    <div className='m-2'>
      <h1> Sequence viewer</h1>

      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1'
        onClick={() => {
          setSeq1Zindex(2)
          setSeq2Zindex(1)
        }}
      > Show seq1</button>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
        onClick={() => {
          setSeq1Zindex(1)
          setSeq2Zindex(2)
        }}
      > Show seq2</button>

      {/* Container for overlapping boxes */}
      <div className='relative h-[200px]'> {/* Set a fixed height for the container */}
        {/* SeqBox 1 - Initial position */}
        <div
          className='seqbox1 absolute top-0 left-0 w-full border border-gray-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
          ref={seqbox1}
          onScroll={handleScroll1}
          style={{ zIndex: seq1Zindex}} // Brings red-bordered box to front
        >
          {seq1.split("").map((char, index) => (
            <Tippy content={tooltip1[index]} key={index}>
              <span style={{ backgroundColor: getBackgroundColor(index, seq1.length) }}>{char}</span>
            </Tippy>
          ))}
        </div>

        {/* SeqBox 2 - Overlapping position */}
        <div
          className='seqbox2 absolute top-0 left-0 w-full border-2 border-red-500 overflow-x-auto whitespace-nowrap font-mono bg-white'
          ref={seqbox2}
          style={{ zIndex: seq2Zindex }} // Brings red-bordered box to front
        >
          {seq2.split("").map((char, index) => (
            <Tippy content={tooltip2[index]} key={index}>
              <span style={{ backgroundColor: getBackgroundColor(index, seq2.length) }} >
                {char}</span>
            </Tippy>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-blue-500 z-10"></div>
      </div>
    </div>
  )
}

export default App