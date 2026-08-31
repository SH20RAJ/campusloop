import type { MediaConnection, Peer } from "peerjs";

export type CallState =
  | "IDLE"
  | "CALLING"
  | "RINGING"
  | "ACCEPTED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "ENDED"
  | "FAILED";

export interface CallEngineCallbacks {
  onStateChange: (state: CallState, error?: string) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onLocalStream: (stream: MediaStream) => void;
  onClose: (reason?: string) => void;
}

export interface CallMediaOptions {
  video: boolean;
  audio: boolean;
  facingMode?: "user" | "environment";
}

/**
 * CallEngine: Encapsulates PeerJS & WebRTC media lifecycle for CampusLoop.
 * Prevents direct coupling between UI components and raw WebRTC APIs.
 */
export class CallEngine {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callbacks: CallEngineCallbacks;
  private isAudioOnly = false;
  private currentFacingMode: "user" | "environment" = "user";

  constructor(callbacks: CallEngineCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Initializes PeerJS client using default cloud or configured ICE servers
   */
  async initPeer(customPeerId?: string): Promise<string> {
    const PeerClass = (await import("peerjs")).default;

    return new Promise((resolve, reject) => {
      try {
        const iceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ];

        this.peer = new PeerClass(customPeerId || "", {
          config: { iceServers },
          debug: process.env.NODE_ENV === "development" ? 1 : 0,
        });

        this.peer.on("open", (id) => {
          resolve(id);
        });

        this.peer.on("call", (incomingCall) => {
          this.handleIncomingPeerCall(incomingCall);
        });

        this.peer.on("error", (err) => {
          console.warn("[CallEngine] PeerJS error:", err);
          this.callbacks.onStateChange("FAILED", err.message || "Peer connection error");
        });

        this.peer.on("disconnected", () => {
          this.callbacks.onStateChange("RECONNECTING");
        });
      } catch (err: any) {
        reject(err);
      }
    });
  }

  /**
   * Requests camera and microphone with graceful audio fallback
   */
  async requestMedia(options: CallMediaOptions): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: options.video ? { facingMode: options.facingMode || "user" } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.isAudioOnly = !options.video;
      this.currentFacingMode = options.facingMode || "user";
      this.callbacks.onLocalStream(this.localStream);
      return this.localStream;
    } catch (videoErr) {
      if (options.video) {
        console.warn("[CallEngine] Video failed, attempting audio-only fallback...");
        const audioConstraints: MediaStreamConstraints = { audio: true, video: false };
        this.localStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        this.isAudioOnly = true;
        this.callbacks.onLocalStream(this.localStream);
        return this.localStream;
      }
      throw videoErr;
    }
  }

  /**
   * Outgoing call to a destination peer ID
   */
  async callPeer(remotePeerId: string, options: CallMediaOptions) {
    if (!this.peer) throw new Error("Peer not initialized");

    const stream = await this.requestMedia(options);
    this.callbacks.onStateChange("CONNECTING");

    const call = this.peer.call(remotePeerId, stream);
    this.setupCallHandlers(call);
  }

  /**
   * Handle and answer incoming call
   */
  private handleIncomingPeerCall(incomingCall: MediaConnection) {
    this.currentCall = incomingCall;
    this.callbacks.onStateChange("RINGING");
  }

  async answerIncomingCall(options: CallMediaOptions) {
    if (!this.currentCall) throw new Error("No incoming call to answer");

    const stream = await this.requestMedia(options);
    this.currentCall.answer(stream);
    this.callbacks.onStateChange("CONNECTING");
    this.setupCallHandlers(this.currentCall);
  }

  private setupCallHandlers(call: MediaConnection) {
    this.currentCall = call;

    call.on("stream", (remoteMediaStream) => {
      this.remoteStream = remoteMediaStream;
      this.callbacks.onRemoteStream(remoteMediaStream);
      this.callbacks.onStateChange("CONNECTED");
    });

    call.on("close", () => {
      this.callbacks.onStateChange("ENDED");
      this.callbacks.onClose("Remote peer hung up");
      this.cleanupMedia();
    });

    call.on("error", (err) => {
      console.error("[CallEngine] Media connection error:", err);
      this.callbacks.onStateChange("FAILED", err.message);
      this.cleanupMedia();
    });
  }

  toggleMicrophone(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  toggleCamera(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  async switchCamera(): Promise<boolean> {
    if (!this.localStream || this.isAudioOnly) return false;

    const newFacingMode = this.currentFacingMode === "user" ? "environment" : "user";
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = this.localStream.getVideoTracks()[0];

      if (oldVideoTrack) {
        this.localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      this.localStream.addTrack(newVideoTrack);
      this.currentFacingMode = newFacingMode;

      // Replace track on the active WebRTC peer connection
      if (this.currentCall?.peerConnection) {
        const senders = this.currentCall.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      this.callbacks.onLocalStream(this.localStream);
      return true;
    } catch {
      return false;
    }
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  endCall() {
    if (this.currentCall) {
      try {
        this.currentCall.close();
      } catch {}
      this.currentCall = null;
    }
    this.cleanupMedia();
    this.callbacks.onStateChange("ENDED");
  }

  private cleanupMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
  }

  destroy() {
    this.endCall();
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }
}
