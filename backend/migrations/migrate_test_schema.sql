-- Migration: Align test schema with new models
-- Date: 2026-03-09
-- Purpose: Update test_results schema to support detailed step tracking

-- Backup old test_results table
CREATE TABLE IF NOT EXISTS test_results_backup AS 
SELECT * FROM test_results;

-- Drop old test_results table (will cascade to call_metrics FK)
ALTER TABLE IF EXISTS call_metrics DROP CONSTRAINT IF EXISTS call_metrics_test_id_fkey;
DROP TABLE IF EXISTS test_results CASCADE;

-- Create new test_runs table
CREATE TABLE IF NOT EXISTS test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credential_id UUID REFERENCES sip_credentials(id) ON DELETE SET NULL,
    test_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    test_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Create new test_results table (detailed step tracking)
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_test_runs_organization ON test_runs(organization_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_started_at ON test_runs(started_at DESC);
CREATE INDEX idx_test_results_test_run ON test_results(test_run_id);
CREATE INDEX idx_test_results_timestamp ON test_results(timestamp);

-- Migrate old data to new schema (best effort)
-- Each old test_results row becomes a test_run with one summary test_result
INSERT INTO test_runs (id, organization_id, test_type, status, started_at, completed_at, test_metadata)
SELECT 
    id,
    (SELECT id FROM organizations LIMIT 1), -- Default org (adjust as needed)
    test_type,
    CASE 
        WHEN status = 'success' THEN 'completed'
        WHEN status = 'failed' THEN 'failed'
        ELSE status
    END,
    started_at,
    completed_at,
    COALESCE(metadata, '{}'::jsonb)
FROM test_results_backup;

INSERT INTO test_results (test_run_id, step_name, status, message, details, timestamp)
SELECT 
    b.id,
    'summary',
    b.status,
    COALESCE(b.response_message, 'Migrated from old schema'),
    jsonb_build_object(
        'response_code', b.response_code,
        'duration_ms', b.duration_ms,
        'sip_server', b.sip_server,
        'sip_port', b.sip_port,
        'transport', b.transport
    ),
    b.created_at
FROM test_results_backup b;

-- Update call_metrics to reference test_runs instead (if needed)
-- ALTER TABLE call_metrics ADD COLUMN test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE;
-- UPDATE call_metrics SET test_run_id = test_id;
-- ALTER TABLE call_metrics DROP COLUMN test_id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON test_runs TO sipper;
GRANT SELECT, INSERT, UPDATE, DELETE ON test_results TO sipper;

-- Migration complete
-- Note: Review test_results_backup and drop when satisfied
-- DROP TABLE test_results_backup;
