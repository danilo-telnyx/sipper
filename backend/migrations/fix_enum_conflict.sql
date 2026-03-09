-- Fix: Remove orphaned courselevel enum
-- This enum had UPPERCASE values which conflicted with Python CourseLevel enum
-- The correct enum is course_level with lowercase values

DROP TYPE IF EXISTS courselevel CASCADE;
