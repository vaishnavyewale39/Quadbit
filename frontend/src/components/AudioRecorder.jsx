import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const AudioRecorder = () => {
    const { isRecording, startRecording, stopRecording, audioBlob, setAudioBlob } = useAudioRecorder();
    const [uploadStatus, setUploadStatus] = useState('');

    const handleUpload = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        setUploadStatus('Uploading...');
        try {
            const response = await fetch('http://localhost:8000/api/audio/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setUploadStatus(`Success: ${JSON.stringify(data)}`);
            setAudioBlob(null); // Reset after upload
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('Upload failed. Is backend running?');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h3>Audio Recorder</h3>
            <div style={{ marginBottom: '15px' }}>
                {!isRecording ? (
                    <button onClick={startRecording} style={{ background: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} style={{ background: '#f44336', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                        Stop Recording
                    </button>
                )}
            </div>

            {audioBlob && (
                <div style={{ marginTop: '15px' }}>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ width: '100%', marginBottom: '10px' }} />
                    <button onClick={handleUpload} style={{ background: '#2196F3', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        Upload & Analyze
                    </button>
                </div>
            )}

            {uploadStatus && (
                <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
                    {uploadStatus}
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
