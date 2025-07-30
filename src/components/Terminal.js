import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Terminal.css';
import { io } from 'socket.io-client';
import { DateTime } from 'luxon';

const Terminal = ({ timeZone = "America/New_York" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [socket, setSocket] = useState(null);
    const terminalRef = useRef(null);

    // Translation array like inStore_shop_cart.js
    const translations = useMemo(() => [
        { input: "Printer", output: "打印机驱动" },
        { input: "Printer not connected", output: "打印机驱动未连接" },
    ], []);

    // Translation function like inStore_shop_cart.js
    const fanyi = useCallback((input) => {
        const lang = localStorage.getItem("Google-language");
        if (lang?.includes("Chinese") || lang?.includes("中")) {
            const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
            return translation ? translation.output : input;
        }
        return input;
    }, [translations]);

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
    
    const getFormattedTime = useCallback(() => {
        try {
            const now = DateTime.now().setZone(timeZone);
            return now.toFormat('yyyy-M-d HH:mm:ss');
        } catch (error) {
            console.error("Invalid timezone, using local time:", error);
            const now = DateTime.now();
            return now.toFormat('yyyy-M-d HH:mm:ss');
        }
    }, [timeZone]);

    useEffect(() => {
        // Delay initialization to ensure everything is ready
        const timer = setTimeout(() => {
            // Initialize Socket.IO connection to specified server
            const newSocket = io('http://localhost:3001');
            setSocket(newSocket);

            // Connection status management
            newSocket.on('connect', () => {
                setIsConnected(true);
                appendLog('system', 'Connected to server', getFormattedTime());
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
                appendLog('system', 'Disconnected from server', getFormattedTime());
            });

            // Connection error handling
            newSocket.on('connect_error', (error) => {
                setIsConnected(false);
                appendLog('error', `Connection error: ${error.message}`, getFormattedTime());
                console.error('Socket.IO connection error:', error);
            });

            // Reconnect attempts
            newSocket.on('reconnect_attempt', (attemptNumber) => {
                appendLog('warning', `Reconnecting... (attempt ${attemptNumber})`, getFormattedTime());
            });

            // Reconnect success
            newSocket.on('reconnect', (attemptNumber) => {
                setIsConnected(true);
                appendLog('success', `Reconnected successfully! (${attemptNumber} attempts)`, getFormattedTime());
            });

            // Receive command output
            newSocket.on('cmd-output', (data) => {
                appendLog(data.type, data.message, data.timestamp);
            });

            // Note: log clearing is now handled locally, no server communication needed
        }, 1000); // Wait 1 second for timeZone to be properly set

        return () => {
            clearTimeout(timer);
            if (socket) {
                socket.close();
            }
        };
    }, [getFormattedTime]);

    // Auto scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Clear logs - pure frontend operation
    const clearLogs = () => {
        setLogs([]);
        appendLog('system', 'Logs cleared', getFormattedTime());
    };

    // Toggle terminal display
    const toggleTerminal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Printer terminal toggle button */}
            <div 
                className={`terminal-toggle-btn ${isConnected ? 'connected' : 'disconnected'}`} 
                onClick={toggleTerminal}
                title={isConnected ? "Print Service Connected" : "Printer not connected"}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="17" cy="11" r="1" fill="currentColor"/>
                </svg>
                <span className="printer-label">{fanyi("Printer")}</span>
                {/* Floating notification bubble - always visible when disconnected */}
                {!isConnected && (
                    <div className="printer-status-bubble">
                        {fanyi("Printer not connected")}
                    </div>
                )}
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