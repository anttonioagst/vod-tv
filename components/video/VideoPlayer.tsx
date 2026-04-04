'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

export interface VideoPlayerProps {
  hlsUrl: string
  mp4Url?: string
  isLive?: boolean
  twitchChannel?: string
  poster?: string
  title: string
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function VideoPlayer({
  hlsUrl,
  mp4Url,
  isLive = false,
  twitchChannel,
  poster,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([])
  const [currentLevel, setCurrentLevel] = useState(-1) // -1 = auto
  const [showControls, setShowControls] = useState(true)

  // --- Inicialização HLS ---
  useEffect(() => {
    const video = videoRef.current
    if (!video || isLive) return

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 })
      hlsRef.current = hls
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels.map((l, i) => ({ height: l.height, index: i })))
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level)
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari nativo
      video.src = hlsUrl
    } else if (mp4Url) {
      video.src = mp4Url
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [hlsUrl, mp4Url, isLive])

  // --- Eventos do vídeo ---
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration || 0)
    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('volumechange', onVolumeChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('volumechange', onVolumeChange)
    }
  }, [])

  // --- Fullscreen ---
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // --- Teclado: Space = play/pause ---
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        togglePlay()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // --- Auto-hide controles ---
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  // --- Handlers ---
  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const v = Number(e.target.value)
    video.volume = v
    video.muted = v === 0
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Number(e.target.value)
  }

  function toggleFullscreen() {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) void container.requestFullscreen()
    else void document.exitFullscreen()
  }

  function handleQualityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const hls = hlsRef.current
    if (!hls) return
    const level = Number(e.target.value)
    hls.currentLevel = level
    setCurrentLevel(level)
  }

  // --- Modo live: embed Twitch ---
  if (isLive && twitchChannel) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-[3px]">
          AO VIVO
        </div>
        <iframe
          src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
          className="w-full h-full"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  // --- Modo VOD: player customizado ---
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={resetControlsTimer}
      onMouseEnter={resetControlsTimer}
    >
      {/* Badge AO VIVO (VOD de live gravada) */}
      {isLive && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-[3px]">
          AO VIVO
        </div>
      )}

      {/* Vídeo */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay de controles */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8
          bg-gradient-to-t from-black/80 to-transparent
          transition-opacity duration-200
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 mb-2 cursor-pointer"
          style={{ accentColor: '#fdff79' }}
        />

        {/* Linha de controles */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-[#fdff79] transition-colors"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="text-white hover:text-[#fdff79] transition-colors"
            aria-label={isMuted ? 'Ativar som' : 'Mudo'}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 cursor-pointer"
            style={{ accentColor: '#fdff79' }}
          />

          {/* Tempo */}
          <span className="text-white text-[10px] font-mono ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Qualidade */}
          {levels.length > 0 && (
            <select
              value={currentLevel}
              onChange={handleQualityChange}
              className="text-[10px] text-white bg-transparent border border-[#3e3e3e] rounded-[3px] px-1 py-0.5 cursor-pointer"
              aria-label="Qualidade"
            >
              <option value={-1}>Auto</option>
              {levels.map((l) => (
                <option key={l.index} value={l.index}>
                  {l.height}p
                </option>
              ))}
            </select>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-[#fdff79] transition-colors"
            aria-label={isFullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
