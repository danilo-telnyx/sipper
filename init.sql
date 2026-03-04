-- SIPPER Database Initialization
-- PostgreSQL 16

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    sip_server VARCHAR(255),
    sip_port INTEGER,
    transport VARCHAR(10),
    response_code INTEGER,
    response_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Call quality metrics table
CREATE TABLE IF NOT EXISTS call_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
    mos_score DECIMAL(3,2),
    jitter_ms DECIMAL(10,2),
    packet_loss_percent DECIMAL(5,2),
    rtt_ms DECIMAL(10,2),
    codec VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_call_metrics_test_id ON call_metrics(test_id);

-- Insert sample data (for testing)
INSERT INTO test_results (test_type, status, sip_server, sip_port, transport, response_code, response_message)
VALUES 
    ('registration', 'success', 'sip.example.com', 5060, 'UDP', 200, 'OK'),
    ('call', 'success', 'sip.example.com', 5060, 'TCP', 200, 'OK')
ON CONFLICT DO NOTHING;
