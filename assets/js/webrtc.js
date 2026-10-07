// ==========================================================================
// LOGIKA WEBRTC & SIGNALING
// ==========================================================================

let localStream = null;
let peerConnection = null;
let currentCallTargetId = null;

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

function initPeerConnection(myUserId, targetUserId) {
  peerConnection = new RTCPeerConnection(rtcConfig);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && chatSubscription) {
      chatSubscription.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          senderId: myUserId,
          targetUserId: targetUserId,
          type: 'candidate',
          candidate: event.candidate
        }
      });
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  peerConnection.onconnectionstatechange = () => {
    if (peerConnection) {
      const state = peerConnection.connectionState;
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        endCall(false);
      }
    }
  };
}

async function startCall(mode) {
  if (!activeChatReceiverId) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return alert("Silakan login terlebih dahulu.");

  currentCallTargetId = activeChatReceiverId;

  const overlay = document.getElementById('webrtc-call-overlay');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('webrtc-status-title').textContent = `Memanggil (${mode.toUpperCase()})...`;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === 'video'
    });

    document.getElementById('local-video').srcObject = localStream;

    initPeerConnection(session.user.id, currentCallTargetId);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    chatSubscription.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: {
        senderId: session.user.id,
        targetUserId: currentCallTargetId,
        type: 'offer',
        sdp: offer,
        mode: mode,
        callerName: session.user.email || 'Pengguna'
      }
    });
  } catch (err) {
    alert("Izin kamera/mikrofon ditolak atau Perangkat tidak mendukung.");
    endCall(false);
  }
}

async function answerCall(callerId, offerSdp, mode) {
  currentCallTargetId = callerId;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const overlay = document.getElementById('webrtc-call-overlay');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('webrtc-status-title').textContent = 'Menghubungkan...';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === 'video'
    });

    document.getElementById('local-video').srcObject = localStream;

    initPeerConnection(session.user.id, callerId);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    chatSubscription.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: {
        senderId: session.user.id,
        targetUserId: callerId,
        type: 'answer',
        sdp: answer
      }
    });

    document.getElementById('webrtc-status-title').textContent = 'Panggilan Terhubung';
  } catch (err) {
    alert("Gagal mengakses media saat menerima telepon.");
    endCall(true);
  }
}

async function handleSignalData(payload) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const myUserId = session.user.id;
  if (payload.targetUserId !== myUserId) return;

  if (payload.type === 'offer') {
    const isConfirm = confirm(`📞 Panggilan ${payload.mode.toUpperCase()} dari ${payload.callerName}. Jawab?`);
    if (isConfirm) {
      openChatFromNavbar();
      answerCall(payload.senderId, payload.sdp, payload.mode);
    } else {
      chatSubscription.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          senderId: myUserId,
          targetUserId: payload.senderId,
          type: 'hangup'
        }
      });
    }
  } else if (payload.type === 'answer' && peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    document.getElementById('webrtc-status-title').textContent = 'Panggilan Terhubung';
  } else if (payload.type === 'candidate' && peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (e) {}
  } else if (payload.type === 'hangup') {
    endCall(false);
  }
}

function endCall(notifyPeer = true) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  if (notifyPeer && chatSubscription && currentCallTargetId && client) {
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        chatSubscription.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: {
            senderId: session.user.id,
            targetUserId: currentCallTargetId,
            type: 'hangup'
          }
        });
      }
    });
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  const localVideo = document.getElementById('local-video');
  const remoteVideo = document.getElementById('remote-video');
  if (localVideo) localVideo.srcObject = null;
  if (remoteVideo) remoteVideo.srcObject = null;

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  currentCallTargetId = null;

  const overlay = document.getElementById('webrtc-call-overlay');
  if (overlay) overlay.style.display = 'none';
}
