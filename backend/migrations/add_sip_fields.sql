-- Migration: Add SIP credential fields
-- Date: 2026-03-06
-- Description: Add port, transport, and outbound_proxy fields to sip_credentials table

-- Add new columns to existing sip_credentials table
ALTER TABLE sip_credentials 
  ADD COLUMN IF NOT EXISTS port INTEGER DEFAULT 5060 NOT NULL,
  ADD COLUMN IF NOT EXISTS transport VARCHAR(10) DEFAULT 'UDP' NOT NULL,
  ADD COLUMN IF NOT EXISTS outbound_proxy VARCHAR(255);

-- Update existing records to ensure they have default values
UPDATE sip_credentials 
SET port = 5060 
WHERE port IS NULL;

UPDATE sip_credentials 
SET transport = 'UDP' 
WHERE transport IS NULL;
