import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './setupProxy'

//add in the ffmpeg library
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
const ffmpeg = createFFmpeg({ log: true })


function App() {
  // keep track of loading state
  const [ready, setReady] = useState(false)
  //add an additional state to hold a video file
  const [video, setVideo] = useState()
  //add a state for the converted GIF
  const [gif, setGif] = useState()
  const downloadRef = useRef(null)


  const load = async () => {
    await ffmpeg.load()
    setReady(true);
  }

  useEffect(() => {
    load()
  }, [])


  //this function will do the conversion from video to GIF
  const convertToGif = async () => {
    //write the file to memory
    ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video))

    //Run the ffmpeg command to grab an input, add a time and return it as gif
    await ffmpeg.run('-i', 'test.mp4', '-t', '2.5', '-ss', '2.0', '-f', 'gif', 'out.gif')

    //Access the file and read the result
    const data = ffmpeg.FS('readFile', 'out.gif')

    //Convert the file to a URL that can  be used in the browser
    const url = URL.createObjectURL(new Blob([data.buffer], {type: 'image/gif'}))
    setGif(url)
  }

    //Allow converted GIFs to download automatically
  useEffect(()=>{
    if(gif){
      downloadRef.current.click()
    }
  },[gif])
  


  return ready ? (
    <div className="App">

    <h1>Video to GIF Converter</h1>
    <p>Turn your videos into quick gifs</p>

      {/* display the video file */}
      { video && <video
                    controls
                    width="600"
                    src={URL.createObjectURL(video)}>
        
        </video>}

      
      {/* add an event handler that grabs the file from the event and selects a file from a list */}
      <input type="file" onChange={(e) => setVideo(e.target.files.item(0))} />

      <h3>Result</h3>

      <button onClick={convertToGif}>Convert</button>

      { gif && <img src={gif} width="600" />}

      { gif && <a href={gif} download ref={downloadRef}></a>}

    </div>
  ) :
  (<p>Loading...</p>)
}

export default App;
