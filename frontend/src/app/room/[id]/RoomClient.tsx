'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import io, { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Shield, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardBack } from '@/components/reading/CardBack';
import { CardFlip } from '@/components/reading/CardFlip';
import { DraggableFanCard } from '@/components/reading/CardFan';
import { cleanMeaningText, type TarotCard } from '@/types/card';

interface Participant {
  socketId: string;
  userId?: string;
  nickname: string;
  avatarUrl: string;
  isMuted: boolean;
  isHost: boolean;
}

interface RoomClientProps {
  roomId: string;
  cards: TarotCard[];
}

export default function RoomClient({ roomId, cards }: RoomClientProps) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [sysMessages, setSysMessages] = useState<string[]>([]);
  const [allowedPickerSocketId, setAllowedPickerSocketId] = useState<string | null>(null);

  // Trạng thái Tarot Board
  const [phase, setPhase] = useState<'idle' | 'mixing' | 'fanout' | 'revealed'>('idle');
  const [drawn, setDrawn] = useState<(TarotCard | null)[]>([null, null, null, null, null]);
  const [reversed, setReversed] = useState<boolean[]>([false, false, false, false, false]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false, false]);
  const [fanCards, setFanCards] = useState<TarotCard[]>([]);

  // Refs quản lý WebRTC
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingIntervalRef = useRef<any>(null);

  // Lấy ra vai trò hiện tại của Client
  const currentParticipant = participants.find((p) => p.socketId === socket?.id);
  const isHost = currentParticipant?.isHost || false;
  const isAllowedToDraw = isHost || socket?.id === allowedPickerSocketId;

  // Xác định vị trí slot trống kế tiếp
  const activeSlotIndex = drawn.findIndex((d) => d === null);
  const allDrawn = activeSlotIndex === -1;

  // Thống kê tin nhắn hệ thống
  const addSystemMessage = useCallback((msg: string) => {
    setSysMessages((prev) => [...prev.slice(-4), msg]);
  }, []);

  // Thiết lập Micro thoại WebRTC P2P
  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      // Mặc định tắt mic khi tham gia
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      // Tạo Analyser để đo chỉ báo nói chuyện
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      let lastSpeaking = false;
      speakingIntervalRef.current = setInterval(() => {
        if (!localStreamRef.current || localStreamRef.current.getAudioTracks()[0]?.enabled === false) {
          if (lastSpeaking) {
            lastSpeaking = false;
            socket?.emit('speaking-state', { isSpeaking: false });
          }
          return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const isSpeaking = average > 12; // Ngưỡng nói chuyện nhạy bén

        if (isSpeaking !== lastSpeaking) {
          lastSpeaking = isSpeaking;
          socket?.emit('speaking-state', { isSpeaking });
        }
      }, 150);

    } catch (err) {
      console.warn('Không thể truy cập Microphone:', err);
      addSystemMessage('Hệ thống đàm thoại không khả dụng do thiếu quyền truy cập Mic.');
    }
  };

  // Tạo Peer Connection mới kết nối tới client khác
  const createPeerConnection = useCallback((targetSocketId: string, initiate: boolean) => {
    if (peerConnections.current[targetSocketId]) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnections.current[targetSocketId] = pc;

    pc.onconnectionstatechange = () => {
      console.log(`WebRTC Connection State với ${targetSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        addSystemMessage('Đã thiết lập đàm thoại thành công.');
      } else if (pc.connectionState === 'failed') {
        addSystemMessage('Kết nối đàm thoại thất bại (bị NAT/Firewall chặn).');
      } else if (pc.connectionState === 'disconnected') {
        addSystemMessage('Đã ngắt kết nối đàm thoại.');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`WebRTC ICE Connection State với ${targetSocketId}: ${pc.iceConnectionState}`);
    };

    // Thêm các track local vào peer
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc-signal', {
          targetSocketId,
          signalData: { candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        // Phát âm thanh của peer
        if (audioElements.current[targetSocketId]) {
          audioElements.current[targetSocketId].srcObject = remoteStream;
        } else {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.autoplay = true;
          // Thêm thuộc tính ẩn và đưa vào DOM để trình duyệt cho phép phát tiếng
          audio.style.display = 'none';
          document.body.appendChild(audio);
          audioElements.current[targetSocketId] = audio;
        }
      }
    };

    if (initiate) {
      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer).then(() => {
          socketRef.current?.emit('webrtc-signal', {
            targetSocketId,
            signalData: { offer },
          });
        });
      });
    }
  }, []);

  // Xử lý khi bật/tắt Mic
  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }

    socket?.emit('mute-toggle', { isMuted: nextState });
  };

  // Trộn bài (Host điều khiển)
  const handleMixClick = () => {
    if (!isAllowedToDraw) return;

    if (phase === 'idle' || phase === 'revealed') {
      // Bắt đầu xào bài
      setPhase('mixing');
      setDrawn([null, null, null, null, null]);
      setReversed([false, false, false, false, false]);
      setRevealed([false, false, false, false, false]);
      socket?.emit('draw-action', { type: 'mixing' });
    } else if (phase === 'mixing') {
      // Dừng xào bài, xòe bài
      const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 24);
      setFanCards(shuffled);
      setPhase('fanout');
      socket?.emit('draw-action', { type: 'fanout', fanCards: shuffled });
    }
  };

  // Chọn bài từ quạt bài (Host điều khiển)
  const handleSelectCard = (card: TarotCard) => {
    if (!isAllowedToDraw || allDrawn || phase !== 'fanout') return;

    const isAlreadyPlaced = drawn.some((d) => d?.id === card.id);
    if (isAlreadyPlaced) return;

    const slotIndex = activeSlotIndex;
    const isReversed = Math.random() > 0.5;

    setDrawn((prev) => {
      const next = [...prev];
      next[slotIndex] = card;
      return next;
    });
    setReversed((prev) => {
      const next = [...prev];
      next[slotIndex] = isReversed;
      return next;
    });

    socket?.emit('draw-action', {
      type: 'place_card',
      slotIndex,
      card,
      isReversed,
    });
  };

  // Lật ngửa bài (Host điều khiển)
  const handleFlipCard = (index: number) => {
    if (!isAllowedToDraw || !drawn[index]) return;

    setRevealed((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });

    socket?.emit('draw-action', {
      type: 'reveal_card',
      slotIndex: index,
    });
  };

  // Reset trải bài (Host điều khiển)
  const handleReset = () => {
    if (!isAllowedToDraw) return;

    setPhase('idle');
    setDrawn([null, null, null, null, null]);
    setReversed([false, false, false, false, false]);
    setRevealed([false, false, false, false, false]);
    setFanCards([]);
    socket?.emit('draw-action', { type: 'reset' });
  };

  // Khởi tạo Socket và WebRTC
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    
    const socketUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '').replace('/api', '')
      : 'http://localhost:3001';

    let activeSocket: Socket | null = null;

    // Khởi chạy tuần tự: Nạp mic xong mới bắt đầu nối socket để tránh race-condition
    initAudio().finally(() => {
      // Force websocket transport để tránh bị đứt kết nối khi người dùng ẩn tab/chuyển tab
      const newSocket = io(socketUrl, { transports: ['websocket'] });
      activeSocket = newSocket;
      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join-room', { roomCode: roomId, token });
      });

      newSocket.on('error', (err: string) => {
        setErrorMsg(err);
        newSocket.disconnect();
      });

      newSocket.on('sys-message', (data: { type: string; message: string }) => {
        addSystemMessage(data.message);
      });

      newSocket.on('picker-delegated', (data: { allowedSocketId: string | null }) => {
        setAllowedPickerSocketId(data.allowedSocketId);
      });

      // Cập nhật danh sách người tham gia & Setup WebRTC đàm thoại
      newSocket.on('room-state', (peersList: Participant[]) => {
        setParticipants(peersList);

        const activeSocketIds = new Set(peersList.map((p) => p.socketId));

        // Dọn dẹp những peer đã rời phòng khỏi WebRTC và DOM
        Object.keys(peerConnections.current).forEach((socketId) => {
          if (!activeSocketIds.has(socketId)) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
            
            if (audioElements.current[socketId]) {
              audioElements.current[socketId].remove();
              delete audioElements.current[socketId];
            }
          }
        });

        // Thiết lập kết nối thoại mesh WebRTC cho peer mới
        peersList.forEach((peer) => {
          if (peer.socketId !== newSocket.id) {
            const initiate = newSocket.id! > peer.socketId;
            createPeerConnection(peer.socketId, initiate);
          }
        });
      });

      // Broker tín hiệu WebRTC thoại
      newSocket.on('webrtc-signal', (data: { senderSocketId: string; signalData: any }) => {
        const { senderSocketId, signalData } = data;
        let pc = peerConnections.current[senderSocketId];

        if (!pc) return;

        if (signalData.offer) {
          pc.setRemoteDescription(new RTCSessionDescription(signalData.offer)).then(() => {
            pc.createAnswer().then((answer) => {
              pc.setLocalDescription(answer).then(() => {
                newSocket.emit('webrtc-signal', {
                  targetSocketId: senderSocketId,
                  signalData: { answer },
                });
              });
            });
          });
        } else if (signalData.answer) {
          pc.setRemoteDescription(new RTCSessionDescription(signalData.answer));
        } else if (signalData.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        }
      });

      // Chỉ báo nói chuyện
      newSocket.on('speaking-state', (data: { socketId: string; isSpeaking: boolean }) => {
        setSpeakingPeers((prev) => ({
          ...prev,
          [data.socketId]: data.isSpeaking,
        }));
      });

      // Đồng bộ Tarot Board từ Reader
      newSocket.on('draw-action', (action: any) => {
        if (action.type === 'mixing') {
          setPhase('mixing');
          setDrawn([null, null, null, null, null]);
          setReversed([false, false, false, false, false]);
          setRevealed([false, false, false, false, false]);
        } else if (action.type === 'fanout') {
          setPhase('fanout');
          setFanCards(action.fanCards);
        } else if (action.type === 'place_card') {
          setDrawn((prev) => {
            const next = [...prev];
            next[action.slotIndex] = action.card;
            return next;
          });
          setReversed((prev) => {
            const next = [...prev];
            next[action.slotIndex] = action.isReversed;
            return next;
          });
        } else if (action.type === 'reveal_card') {
          setRevealed((prev) => {
            const next = [...prev];
            next[action.slotIndex] = !next[action.slotIndex];
            return next;
          });
        } else if (action.type === 'reset') {
          setPhase('idle');
          setDrawn([null, null, null, null, null]);
          setReversed([false, false, false, false, false]);
          setRevealed([false, false, false, false, false]);
          setFanCards([]);
        }
      });
    });

    return () => {
      if (activeSocket) (activeSocket as Socket).disconnect();
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      
      // Xóa toàn bộ audio elements khỏi DOM
      Object.values(audioElements.current).forEach((audio) => audio.remove());
      audioElements.current = {};
    };
  }, [roomId, createPeerConnection, addSystemMessage]);

  if (errorMsg) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-3xl border border-ink/10 bg-cream/35 p-8">
          <span className="text-3xl">⚠️</span>
          <h2 className="font-serif text-2xl text-ink mt-3">Lỗi Kết Nối</h2>
          <p className="mt-2.5 text-sm text-ink/60">{errorMsg}</p>
          <Button variant="pill" className="mt-6" onClick={() => router.push('/room')}>
            Trở lại danh sách phòng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col items-center px-4 pt-4 pb-24 z-10 min-h-[calc(100dvh-4rem)]">
      
      {/* Thanh Header của Room */}
      <div className="flex w-full max-w-6xl items-center justify-between border-b border-ink/5 pb-3.5 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/room')}
            className="rounded-full border border-ink/10 bg-white/50 p-2 text-ink/70 hover:bg-white hover:text-ink transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl md:text-2xl text-ink font-bold leading-tight flex items-center gap-1.5">
              Phòng Tarot 🐸
            </h1>
            <p className="text-xs tracking-wider text-ink/50 font-bold uppercase mt-0.5">
              Mã Phòng: <span className="text-ink font-bold select-all bg-cream px-2 py-0.5 rounded text-sm">{roomId}</span>
            </p>
          </div>
        </div>

        {/* Nút Mic và thông tin trạng thái */}
        <div className="flex items-center gap-3.5">
          <Button
            variant="pill"
            onClick={toggleMute}
            className={`h-10 px-5 text-sm font-bold flex items-center gap-2 transition-all ${
              isMuted
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 animate-pulse'
            }`}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isMuted ? 'Mở Mic' : 'Tắt Mic'}
          </Button>

          {isHost && (
            <span className="hidden items-center gap-1 text-xs font-bold tracking-widest text-ink/50 uppercase bg-ink/5 px-3 py-2 rounded-full md:flex">
              <Shield className="h-3 w-3" /> Reader
            </span>
          )}
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid w-full max-w-6xl grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Cột Trái/Bảng Chính: Chứa 5 ô bốc bài Tarot */}
        <div className="lg:col-span-3 flex flex-col items-center gap-8 relative">
          
          {/* Nút Trải lại đặt ở phía trên các ô bài để tránh bị che bởi các lá bài xòe ra */}
          {isAllowedToDraw && (phase === 'fanout' || allDrawn) && (
            <div className="w-full flex justify-end -mb-4">
              <Button
                variant="pill"
                onClick={handleReset}
                className="h-9 px-4 text-xs font-semibold flex items-center gap-1.5 bg-cream/70 hover:bg-cream border border-ink/10 shadow-sm transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Trải lại
              </Button>
            </div>
          )}
          
          {/* Khu vực 5 ô bài Tarot */}
          <div className="flex w-full justify-center gap-3 sm:gap-4 md:gap-5 flex-wrap min-h-[220px]">
            {drawn.map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  onClick={() => i < 5 && isAllowedToDraw && handleFlipCard(i)}
                  className={`relative flex h-[var(--card-h)] w-[var(--card-w)] items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-cream/10 transition-all ${
                    card && isAllowedToDraw ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                  style={{
                    boxShadow: revealed[i] ? '0 8px 24px rgba(62,66,88,0.1)' : 'none',
                  }}
                >
                  {card ? (
                    <CardFlip
                      imageUrl={card.imageUrl}
                      alt={card.nameVi}
                      isReversed={reversed[i]}
                      isFlipped={revealed[i]}
                    />
                  ) : (
                    <span className="font-serif text-xs text-ink/30">Lá {i + 1}</span>
                  )}
                </div>
                {card && (
                  <div className="text-center w-[var(--card-w)] mt-1">
                    <p className="font-serif text-[10px] font-semibold text-ink line-clamp-1">
                      {revealed[i] ? card.nameVi : `Ẩn số ${i + 1}`}
                    </p>
                    <p className="text-[8px] text-ink/40 uppercase tracking-widest line-clamp-1">
                      {revealed[i] ? (reversed[i] ? 'Ngược' : 'Xuôi') : 'Chưa lật'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Khu vực xào bài hoặc quạt bài xòe ra */}
          <div className="relative w-full h-[220px] flex items-center justify-center border-t border-ink/5 pt-4">
            {isAllowedToDraw ? (
              <>
                {phase === 'idle' && (
                  <div
                    onClick={handleMixClick}
                    className="group cursor-pointer flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <div className="h-[var(--card-h)] w-[var(--card-w)] relative">
                      <CardBack />
                    </div>
                    <span className="text-[10px] tracking-wider text-ink/45 font-semibold uppercase animate-pulse">
                      Chạm bộ bài để xào
                    </span>
                  </div>
                )}

                {phase === 'mixing' && (
                  <div
                    onClick={handleMixClick}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2"
                    style={{ width: 'var(--card-w)', height: 'var(--card-h)', perspective: '800px' }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute bottom-0 left-0 h-[var(--card-h)] w-[var(--card-w)] pointer-events-none ${
                          i % 2 === 0 ? 'anim-shuffle-left' : 'anim-shuffle-right'
                        }`}
                        style={{
                          transform: `translateY(-${i * 2}px)`,
                          zIndex: 20 - i,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      >
                        <CardBack />
                      </div>
                    ))}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-wider text-ink/50 font-bold whitespace-nowrap uppercase">
                      Đang xào... Chạm lần nữa để xòe bài
                    </span>
                  </div>
                )}

                {phase === 'fanout' && (
                  <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <div className="relative w-full max-w-lg h-[var(--card-h)]">
                      {fanCards.map((card, i) => {
                        const isPlaced = drawn.some((d) => d?.id === card.id);
                        return (
                          <DraggableFanCard
                            key={card.id}
                            card={card}
                            index={i}
                            total={fanCards.length}
                            isHidden={isPlaced}
                            isDisabled={allDrawn || isPlaced}
                            onClick={() => handleSelectCard(card)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nút Trải lại đã được chuyển lên đầu bảng chính để tránh bị che khuất */}
              </>
            ) : (
              // Bảng chờ của người xem (Querent)
              <div className="text-center text-ink/50 flex flex-col items-center justify-center p-6 bg-cream/15 rounded-3xl border border-dashed border-ink/10 max-w-md w-full">
                <span className="text-2xl mb-1.5">🔮</span>
                <h3 className="font-serif text-sm font-semibold text-ink">Bàn luận chiêm nghiệm</h3>
                <p className="text-xs leading-relaxed text-ink/60 mt-1">
                  Chủ phòng đang xào bài và bốc bài. Kết quả bốc và lật bài sẽ tự động đồng bộ trên màn hình này thời gian thực.
                </p>
                {phase === 'mixing' && (
                  <p className="text-[10px] font-bold text-ink/40 tracking-wider uppercase mt-4 animate-pulse">
                    {allowedPickerSocketId
                      ? `${participants.find((p) => p.socketId === allowedPickerSocketId)?.nickname || 'Querent'} đang xào bài...`
                      : 'Reader đang xào bài...'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ý nghĩa giải mã của các lá bài đã lật (Chỉ hiển thị khi có lá bài đã lật) */}
          <div className="w-full flex flex-col gap-4">
            {drawn.map((card, idx) => {
              if (!card || !revealed[idx]) return null;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-2xl border border-ink/10 bg-cream/80 p-5 text-left backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-ink/10 text-ink/80">Lá thứ {idx + 1}</span>
                    <h3 className="font-serif text-lg text-ink font-semibold">{card.nameVi}</h3>
                    <span className="text-xs text-ink/50 italic">
                      ({card.nameEn} {reversed[idx] ? '• Chiều Ngược' : '• Chiều Xuôi'})
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink/75 mt-2.5">
                    {cleanMeaningText(
                      reversed[idx] ? card.reversedMeaning ?? '' : card.uprightMeaning ?? ''
                    )}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Cột Phải: Danh sách Avatar người tham gia & Logs hệ thống */}
        <div className="flex flex-col gap-6">
          
          {/* Khung thành viên (Max 4) */}
          <div className="rounded-3xl border border-ink/10 bg-cream/35 p-6">
            <h3 className="font-serif text-base font-bold text-ink/85 mb-4 border-b border-ink/5 pb-2">
              Thành viên ({participants.length}/4)
            </h3>
            
            <div className="flex flex-col gap-4">
              {participants.map((peer) => {
                const isSpeaking = speakingPeers[peer.socketId] || false;
                return (
                  <div key={peer.socketId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      
                      {/* Avatar tròn với viền sáng nhấp nháy khi nói */}
                      <div
                        className="relative h-11 w-11 overflow-hidden rounded-full border border-ink/10 bg-cream transition-all duration-200"
                        style={{
                          boxShadow: isSpeaking ? '0 0 12px #22c55e' : 'none',
                          border: isSpeaking ? '2px solid #22c55e' : '1px solid rgba(62,66,88,0.1)',
                        }}
                      >
                        <Image
                          src={peer.avatarUrl || '/images/avatars/frog1.png'}
                          alt={peer.nickname}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-ink">{peer.nickname}</span>
                          {peer.isHost && <span className="text-[9px] bg-ink/10 text-ink/75 font-bold px-1.5 py-0.5 rounded">host</span>}
                          {allowedPickerSocketId === peer.socketId && (
                            <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                              <Sparkles className="h-2.5 w-2.5" /> Bốc bài
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink/50 tracking-wider uppercase font-semibold">
                          {peer.isMuted ? 'Đang tắt mic' : 'Đang mở mic'}
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center gap-2">
                      {isHost && !peer.isHost && (
                        <button
                          onClick={() => {
                            const target = allowedPickerSocketId === peer.socketId ? null : peer.socketId;
                            socket?.emit('delegate-picker', { targetSocketId: target });
                          }}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all border ${
                            allowedPickerSocketId === peer.socketId
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : 'bg-cream hover:bg-ink/5 text-ink/70 border-ink/10'
                          }`}
                        >
                          {allowedPickerSocketId === peer.socketId ? 'Thu hồi' : 'Cho bốc'}
                        </button>
                      )}

                      {peer.isMuted ? (
                        <MicOff className="h-4 w-4 text-red-400" />
                      ) : (
                        <Mic className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Khung Hoạt động hệ thống */}
          <div className="rounded-3xl border border-ink/10 bg-cream/35 p-6 min-h-[160px] flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-ink/85 mb-3 border-b border-ink/5 pb-2">
                Nhật ký phòng thoại
              </h3>
              <div className="flex flex-col gap-2.5">
                {sysMessages.length === 0 ? (
                  <p className="text-xs text-ink/40 italic">Đang chờ sự kiện...</p>
                ) : (
                  sysMessages.map((msg, idx) => (
                    <p key={idx} className="text-xs text-ink/75 leading-normal">
                      • {msg}
                    </p>
                  ))
                )}
              </div>
            </div>
            
            <p className="text-[9px] text-center text-ink/30 mt-4 leading-normal">
              Kết nối thoại WebRTC P2P được mã hoá an toàn trực tiếp giữa các trình duyệt.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
