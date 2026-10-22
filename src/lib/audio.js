// Ambient Web Audio Synthesizer (Chime & Bell) - NEXUSS X TJKT 1
// --- Ambient Web Audio Synthesizer (Chime & Bell) ---
const playLoFiChime=()=>{try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;const ctx=new AudioContext();if(ctx.state==='suspended'){ctx.resume();}const notes=[523.25,659.25,783.99,1046.50];// C5, E5, G5, C6
notes.forEach((freq,idx)=>{const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,ctx.currentTime+idx*0.12);gain.gain.setValueAtTime(0,ctx.currentTime+idx*0.12);gain.gain.linearRampToValueAtTime(0.08,ctx.currentTime+idx*0.12+0.04);gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+idx*0.12+0.8);osc.connect(gain);gain.connect(ctx.destination);osc.start(ctx.currentTime+idx*0.12);osc.stop(ctx.currentTime+idx*0.12+0.85);});}catch(e){console.warn('Audio note play error:',e);}};// --- Safe LocalStorage Utilities ---

if (typeof window !== 'undefined') {
  window.playLoFiChime = playLoFiChime;
}

export { playLoFiChime };
