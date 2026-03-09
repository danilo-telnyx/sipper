#!/usr/bin/env python3
"""
Convert Agent 5's complete markdown content to TypeScript format
Generates full sampleCourseData.ts with all 15 sections and 105 questions
"""

import json
import re
from pathlib import Path

# Read the complete Level 3 content
level3_path = Path(__file__).parent.parent / "docs/content-writing/level3/LEVEL3_COMPLETE_CONTENT.md"
with open(level3_path, 'r') as f:
    content = f.read()

# Parse sections from markdown
sections = []
current_section = None
current_questions = []

lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    
    # Detect section header: ## Section X: Title
    if line.startswith('## Section '):
        if current_section:
            current_section['questions'] = current_questions
            sections.append(current_section)
            current_questions = []
        
        # Parse section number and title
        match = re.match(r'## Section (\d+): (.+)', line)
        if match:
            num = int(match.group(1))
            title = match.group(2)
            
            # Determine level based on section number
            if num <= 5:
                level = 'basic'
            elif num <= 10:
                level = 'intermediate'
            else:
                level = 'advanced'
            
            current_section = {
                'id': f'section-{level[0]}-{num}',
                'title': title,
                'level': level,
                'order': num,
                'content': '',
                'sip_blocks': [],
                'callouts': [],
                'key_takeaways': []
            }
    
    # Detect content section
    elif line.startswith('### Content:') and current_section:
        i += 1
        content_lines = []
        while i < len(lines) and not lines[i].startswith('###'):
            content_lines.append(lines[i])
            i += 1
        current_section['content'] = '\n'.join(content_lines).strip()
        i -= 1
    
    # Detect questions section
    elif line.startswith('### Questions:') and current_section:
        i += 1
        while i < len(lines) and lines[i].startswith('#### Question '):
            # Parse question
            q_match = re.match(r'#### Question \d+: (.+)', lines[i])
            if q_match:
                question_text = q_match.group(1)
                i += 1
                
                # Parse options
                options = []
                correct_idx = 0
                while i < len(lines) and lines[i].strip().startswith(('A)', 'B)', 'C)', 'D)')):
                    opt_line = lines[i].strip()
                    if opt_line.startswith('**'):
                        # Correct answer (bolded)
                        correct_idx = len(options)
                        opt_line = opt_line.replace('**', '')
                    
                    # Remove A), B), etc.
                    opt_text = re.sub(r'^[A-D]\)\s*', '', opt_line)
                    options.append(opt_text)
                    i += 1
                
                # Parse explanation
                if i < len(lines) and lines[i].startswith('**Explanation:**'):
                    i += 1
                    explanation = lines[i].strip()
                else:
                    explanation = "Correct!"
                
                current_questions.append({
                    'id': f'q-{current_section["id"]}-{len(current_questions) + 1}',
                    'section_id': current_section['id'],
                    'text': question_text,
                    'options': options,
                    'correct_answer': correct_idx,
                    'explanation': explanation,
                    'difficulty': 'medium'
                })
            i += 1
        i -= 1
    
    i += 1

# Add last section
if current_section:
    current_section['questions'] = current_questions
    sections.append(current_section)

print(f"Parsed {len(sections)} sections")

# Count total questions
total_questions = sum(len(s['questions']) for s in sections)
print(f"Total questions: {total_questions}")

# Generate TypeScript content
ts_lines = [
    "/**",
    " * Complete SIP E-Learning Content - All 15 Sections",
    " * Generated from Agent 5's markdown content",
    f" * {len(sections)} sections, {total_questions} questions",
    " */",
    "",
    "import { SectionContent, QuizQuestion } from '@/contexts/ELearningAdminContext';",
    "",
    "export const completeSections: SectionContent[] = ["
]

# Add sections
for section in sections:
    ts_lines.append("  {")
    ts_lines.append(f"    id: '{section['id']}',")
    ts_lines.append("    course_id: 'course-sip-101',")
    ts_lines.append(f"    title: {json.dumps(section['title'])},")
    
    # Escape content for TypeScript
    content_str = section['content'].replace('`', '\\`').replace('$', '\\$')
    ts_lines.append(f"    content: `{content_str}`,")
    
    ts_lines.append(f"    order: {section['order']},")
    ts_lines.append("    is_published: true,")
    ts_lines.append("    sip_blocks: [],")
    ts_lines.append("    callouts: [],")
    ts_lines.append("    ladder_diagrams: [],")
    ts_lines.append("    key_takeaways: []")
    ts_lines.append("  },")

ts_lines.append("];")
ts_lines.append("")

# Add questions
ts_lines.append("export const completeQuestions: QuizQuestion[] = [")
for section in sections:
    for q in section['questions']:
        ts_lines.append("  {")
        ts_lines.append(f"    id: '{q['id']}',")
        ts_lines.append(f"    section_id: '{q['section_id']}',")
        ts_lines.append(f"    text: {json.dumps(q['text'])},")
        ts_lines.append(f"    options: {json.dumps(q['options'])},")
        ts_lines.append(f"    correct_answer: {q['correct_answer']},")
        ts_lines.append(f"    explanation: {json.dumps(q['explanation'])},")
        ts_lines.append(f"    difficulty: '{q['difficulty']}'")
        ts_lines.append("  },")
ts_lines.append("];")

# Write output
output_path = Path(__file__).parent.parent / "frontend/src/data/completeContent.ts"
with open(output_path, 'w') as f:
    f.write('\n'.join(ts_lines))

print(f"✅ Generated {output_path}")
print(f"✅ {len(sections)} sections, {total_questions} questions")
