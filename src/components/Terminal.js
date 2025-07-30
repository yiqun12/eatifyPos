import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';
import { io } from 'socket.io-client';

const Terminal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [socket, setSocket] = useState(null);
    const terminalRef = useRef(null);

    useEffect(() => {
        // Initialize Socket.IO connection to specified server
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        // Connection status management
        newSocket.on('connect', () => {
            setIsConnected(true);
            appendLog('system', 'Connected to server', new Date().toLocaleString());
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            appendLog('system', 'Disconnected from server', new Date().toLocaleString());
        });

        // Connection error handling
        newSocket.on('connect_error', (error) => {
            setIsConnected(false);
            appendLog('error', `Connection error: ${error.message}`, new Date().toLocaleString());
            console.error('Socket.IO connection error:', error);
        });

        // Reconnect attempts
        newSocket.on('reconnect_attempt', (attemptNumber) => {
            appendLog('warning', `Reconnecting... (attempt ${attemptNumber})`, new Date().toLocaleString());
        });

        // Reconnect success
        newSocket.on('reconnect', (attemptNumber) => {
            setIsConnected(true);
            appendLog('success', `Reconnected successfully! (${attemptNumber} attempts)`, new Date().toLocaleString());
        });

        // Receive command output
        newSocket.on('cmd-output', (data) => {
            appendLog(data.type, data.message, data.timestamp);
        });

        // Receive log clear signal
        newSocket.on('logs-cleared', () => {
            setLogs([]);
            appendLog('system', 'Logs cleared', new Date().toLocaleString());
        });

        return () => {
            newSocket.close();
        };
    }, []);

    // Add log entry
    const appendLog = (type, message, timestamp) => {
        const logEntry = {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp
        };
        setLogs(prevLogs => [...prevLogs, logEntry]);
    };

    // Auto scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Clear logs
    const clearLogs = () => {
        if (socket) {
            socket.emit('clear-logs');
        }
    };

    // Toggle terminal display
    const toggleTerminal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Terminal toggle button */}
            <div className="terminal-toggle-btn" onClick={toggleTerminal}>
                <i className="bi bi-terminal"></i>
                <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            </div>

            {/* Terminal panel */}
            <div className={`terminal-panel ${isOpen ? 'open' : ''}`}>
                <div className="terminal-header">
                    <div className="terminal-title">
                        <span>Print Service Terminal</span>
                        <div className="connection-status">
                            <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                    <div className="terminal-controls">
                        <button className="btn-clear" onClick={clearLogs} title="Clear logs">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18" stroke="currentColor" strokeWidth="2"/>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                        <button className="terminal-btn-close" onClick={toggleTerminal} title="Close">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/>
                                <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="terminal-body" ref={terminalRef}>
                    {logs.map(log => (
                        <div key={log.id} className={`log-entry ${log.type}`}>
                            <span className="timestamp">[{log.timestamp}]</span>
                            <span className="message">{log.message}</span>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="log-entry system">
                            <span className="message">Waiting for command output...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className="terminal-overlay" onClick={toggleTerminal}></div>}
        </>
    );
};

export default Terminal;