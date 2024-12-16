// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import useWebSocket from '@/hooks/useWebSocket';

export default function Home() {
  const [wsUrl, setWsUrl] = useState('');
  const [isLocalMode, setIsLocalMode] = useState(false);
  const { connected, status, sendMessage } = useWebSocket(wsUrl);

  const handleConnect = () => {
    // Check if running in development or preview mode
    const isDev = process.env.NODE_ENV === 'development';
    setIsLocalMode(isDev);
  };

  const handleCommand = (command) => {
    sendMessage({ type: 'command', command });
  };

  return (
    <main className="p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">Printer Control POC</h1>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            WebSocket URL (e.g., ws://192.168.1.100:8989)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Enter WebSocket URL"
            />
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Connect
            </button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {status && (
            <div className="space-y-2">
              <h2 className="font-semibold">Printer Status:</h2>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Test Commands:</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleCommand('status')}
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={!connected}
            >
              Get Status
            </button>
            <button
              onClick={() => handleCommand('home')}
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={!connected}
            >
              Home Printer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}