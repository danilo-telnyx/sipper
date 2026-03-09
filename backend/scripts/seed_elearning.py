"""Seed e-learning data with SIP courses."""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models import Course, Section, Question, CourseLevel, QuestionType


async def seed_courses():
    """Seed courses, sections, and questions."""
    async with AsyncSessionLocal() as db:
        # Check if courses already exist
        from sqlalchemy import select
        result = await db.execute(select(Course))
        existing_courses = result.scalars().all()
        
        if existing_courses:
            print("⚠️  Courses already exist. Skipping seed.")
            return
        
        print("🌱 Seeding e-learning data...")
        
        # ====== BASIC COURSE ======
        basic_course = Course(
            level=CourseLevel.BASIC,
            title="SIP Fundamentals",
            description="Introduction to Session Initiation Protocol basics",
            order=1,
            is_active=True
        )
        db.add(basic_course)
        await db.flush()  # Get course ID
        
        # Basic sections
        basic_sections = [
            {"title": "What is SIP?", "content": "# What is SIP?\n\nSession Initiation Protocol (SIP) is a signaling protocol used for initiating, maintaining, and terminating real-time communication sessions.\n\n## Key Features\n- Text-based protocol\n- Works with multimedia sessions\n- Based on HTTP-like request/response model", "order": 1},
            {"title": "SIP Architecture", "content": "# SIP Architecture\n\n## Components\n- **User Agent Client (UAC)**: Initiates requests\n- **User Agent Server (UAS)**: Responds to requests\n- **Proxy Server**: Routes SIP messages\n- **Registrar**: Accepts REGISTER requests", "order": 2},
            {"title": "SIP URIs", "content": "# SIP URIs\n\nSIP uses Uniform Resource Identifiers similar to email addresses.\n\n## Format\n```\nsip:user@domain:port\n```\n\n## Examples\n- `sip:alice@example.com`\n- `sip:bob@192.168.1.1:5060`", "order": 3},
            {"title": "SIP Methods", "content": "# SIP Methods\n\n## Core Methods\n- **INVITE**: Initiate a session\n- **ACK**: Confirm final response\n- **BYE**: Terminate a session\n- **CANCEL**: Cancel pending request\n- **REGISTER**: Register contact", "order": 4},
            {"title": "SIP Responses", "content": "# SIP Response Codes\n\n## Categories\n- **1xx**: Provisional (100 Trying, 180 Ringing)\n- **2xx**: Success (200 OK)\n- **3xx**: Redirection\n- **4xx**: Client Error (404 Not Found)\n- **5xx**: Server Error\n- **6xx**: Global Failure", "order": 5},
            {"title": "Basic Call Flow", "content": "# Basic SIP Call Flow\n\n```\nAlice         Proxy         Bob\n  |  INVITE ->   |             |\n  |              | -> INVITE -> |\n  | <- 100 Trying |             |\n  |              | <- 180 Ringing\n  | <- 180 Ringing              |\n  |              | <- 200 OK    |\n  | <- 200 OK    |              |\n  |  ACK ->      | -> ACK ->    |\n  |    (media session)          |\n  |  BYE ->      | -> BYE ->    |\n  | <- 200 OK    | <- 200 OK   |\n```", "order": 6},
        ]
        
        for sec_data in basic_sections:
            section = Section(course_id=basic_course.id, **sec_data)
            db.add(section)
        
        # Basic quiz questions (5)
        basic_quiz = [
            {"question_text": "What does SIP stand for?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Session Initiation Protocol", "Simple Internet Protocol", "Secure IP Protocol", "Signaling Interface Protocol"], "answer": "Session Initiation Protocol", "order": 1},
            {"question_text": "SIP is a text-based protocol similar to HTTP.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "explanation": "SIP uses HTTP-like request/response model with text headers.", "order": 2},
            {"question_text": "Which SIP method is used to initiate a session?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["INVITE", "REGISTER", "BYE", "ACK"], "answer": "INVITE", "order": 3},
            {"question_text": "What is the SIP response code for 'Ringing'?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["180", "200", "100", "404"], "answer": "180", "order": 4},
            {"question_text": "A UAC initiates SIP requests.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "explanation": "User Agent Client (UAC) initiates requests.", "order": 5},
        ]
        
        for q_data in basic_quiz:
            question = Question(
                course_id=basic_course.id,
                question_text=q_data["question_text"],
                question_type=q_data["type"],
                options=q_data["options"],
                correct_answer=q_data["answer"],
                explanation=q_data.get("explanation"),
                is_exam_question=False,
                order=q_data["order"]
            )
            db.add(question)
        
        # Basic exam questions (15)
        basic_exam = [
            {"question_text": "What port does SIP use by default?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["5060", "8080", "80", "443"], "answer": "5060", "order": 1},
            {"question_text": "Which component accepts REGISTER requests?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Registrar", "Proxy", "UAC", "UAS"], "answer": "Registrar", "order": 2},
            {"question_text": "SIP can work with video sessions.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "explanation": "SIP supports multimedia sessions including video.", "order": 3},
            {"question_text": "The BYE method is used to terminate a session.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 4},
            {"question_text": "What does 200 OK indicate?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Success", "Ringing", "Trying", "Error"], "answer": "Success", "order": 5},
            {"question_text": "ACK confirms which type of response?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Final response", "Provisional response", "All responses", "Error responses"], "answer": "Final response", "order": 6},
            {"question_text": "SIP URIs look like email addresses.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 7},
            {"question_text": "Which response code means 'Not Found'?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["404", "200", "500", "180"], "answer": "404", "order": 8},
            {"question_text": "Proxy servers route SIP messages.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 9},
            {"question_text": "CANCEL is used to cancel which type of request?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Pending request", "Completed request", "Any request", "Error request"], "answer": "Pending request", "order": 10},
            {"question_text": "5xx response codes indicate server errors.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 11},
            {"question_text": "What is the first step in a basic SIP call?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["INVITE", "REGISTER", "ACK", "BYE"], "answer": "INVITE", "order": 12},
            {"question_text": "SIP is based on the HTTP protocol model.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 13},
            {"question_text": "Which component responds to SIP requests?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["UAS", "UAC", "Proxy", "Registrar"], "answer": "UAS", "order": 14},
            {"question_text": "100 Trying is a provisional response.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 15},
        ]
        
        for q_data in basic_exam:
            question = Question(
                course_id=basic_course.id,
                question_text=q_data["question_text"],
                question_type=q_data["type"],
                options=q_data["options"],
                correct_answer=q_data["answer"],
                explanation=q_data.get("explanation"),
                is_exam_question=True,
                order=q_data["order"]
            )
            db.add(question)
        
        print(f"✅ Created Basic course with {len(basic_sections)} sections, {len(basic_quiz)} quiz questions, {len(basic_exam)} exam questions")
        
        # ====== INTERMEDIATE COURSE ======
        intermediate_course = Course(
            level=CourseLevel.INTERMEDIATE,
            title="SIP Advanced Concepts",
            description="Deep dive into SIP headers, dialogs, and transactions",
            order=2,
            is_active=True
        )
        db.add(intermediate_course)
        await db.flush()
        
        # Intermediate sections (example - can expand)
        intermediate_sections = [
            {"title": "SIP Headers", "content": "# SIP Headers\n\n## Essential Headers\n- **Via**: Path the request has taken\n- **From**: Initiator of the request\n- **To**: Intended recipient\n- **Call-ID**: Unique identifier\n- **CSeq**: Command sequence number", "order": 1},
            {"title": "SIP Dialogs", "content": "# SIP Dialogs\n\nA dialog is a peer-to-peer SIP relationship between two UAs.\n\n## Dialog Establishment\n1. Created by INVITE\n2. Identified by Call-ID, From tag, To tag\n3. Maintains session state", "order": 2},
            {"title": "SIP Transactions", "content": "# SIP Transactions\n\n## Types\n- **INVITE Transaction**: More complex, includes ACK\n- **Non-INVITE Transaction**: Simpler, no ACK\n\n## States\n- Trying\n- Proceeding\n- Completed\n- Terminated", "order": 3},
        ]
        
        for sec_data in intermediate_sections:
            section = Section(course_id=intermediate_course.id, **sec_data)
            db.add(section)
        
        # Add minimal quiz/exam questions for intermediate (can expand)
        inter_quiz = [
            {"question_text": "Which header uniquely identifies a SIP dialog?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Call-ID", "Via", "CSeq", "From"], "answer": "Call-ID", "order": 1},
            {"question_text": "The Via header shows the path a request has taken.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 2},
            {"question_text": "What does CSeq stand for?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Command Sequence", "Call Sequence", "Client Sequence", "Connection Sequence"], "answer": "Command Sequence", "order": 3},
            {"question_text": "A dialog is established by which method?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["INVITE", "REGISTER", "OPTIONS", "INFO"], "answer": "INVITE", "order": 4},
            {"question_text": "Non-INVITE transactions do not require ACK.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 5},
        ]
        
        for q_data in inter_quiz:
            question = Question(
                course_id=intermediate_course.id,
                question_text=q_data["question_text"],
                question_type=q_data["type"],
                options=q_data["options"],
                correct_answer=q_data["answer"],
                is_exam_question=False,
                order=q_data["order"]
            )
            db.add(question)
        
        # Intermediate exam (15 questions - simplified for demo)
        for i in range(1, 16):
            question = Question(
                course_id=intermediate_course.id,
                question_text=f"Intermediate exam question {i}",
                question_type=QuestionType.TRUE_FALSE,
                options=["True", "False"],
                correct_answer="True",
                is_exam_question=True,
                order=i
            )
            db.add(question)
        
        print(f"✅ Created Intermediate course")
        
        # ====== ADVANCED COURSE ======
        advanced_course = Course(
            level=CourseLevel.ADVANCED,
            title="SIP Mastery & Troubleshooting",
            description="Expert-level SIP including security, NAT traversal, and debugging",
            order=3,
            is_active=True
        )
        db.add(advanced_course)
        await db.flush()
        
        # Advanced sections (example)
        advanced_sections = [
            {"title": "SIP Security", "content": "# SIP Security\n\n## Threats\n- Registration hijacking\n- Call hijacking\n- Denial of Service\n\n## Solutions\n- TLS for transport security\n- Digest authentication\n- SIPS URI scheme", "order": 1},
            {"title": "NAT Traversal", "content": "# NAT Traversal\n\n## Problems\n- Private IP in SIP headers\n- Media path issues\n\n## Solutions\n- STUN\n- TURN\n- ICE\n- SBC (Session Border Controller)", "order": 2},
            {"title": "SIP Debugging", "content": "# SIP Debugging\n\n## Tools\n- Wireshark\n- sngrep\n- SIPp\n\n## Techniques\n- Capture SIP traffic\n- Analyze call flows\n- Check timing\n- Verify SDP", "order": 3},
        ]
        
        for sec_data in advanced_sections:
            section = Section(course_id=advanced_course.id, **sec_data)
            db.add(section)
        
        # Add minimal quiz/exam for advanced
        adv_quiz = [
            {"question_text": "What is SIPS used for?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Secure SIP over TLS", "SIP over UDP", "SIP over TCP", "SIP Proxy"], "answer": "Secure SIP over TLS", "order": 1},
            {"question_text": "STUN helps with NAT traversal.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 2},
            {"question_text": "Which tool is commonly used for SIP capture?", "type": QuestionType.MULTIPLE_CHOICE, "options": ["Wireshark", "curl", "ping", "nslookup"], "answer": "Wireshark", "order": 3},
            {"question_text": "SBC stands for Session Border Controller.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 4},
            {"question_text": "ICE combines STUN and TURN.", "type": QuestionType.TRUE_FALSE, "options": ["True", "False"], "answer": "True", "order": 5},
        ]
        
        for q_data in adv_quiz:
            question = Question(
                course_id=advanced_course.id,
                question_text=q_data["question_text"],
                question_type=q_data["type"],
                options=q_data["options"],
                correct_answer=q_data["answer"],
                is_exam_question=False,
                order=q_data["order"]
            )
            db.add(question)
        
        # Advanced exam (15 questions)
        for i in range(1, 16):
            question = Question(
                course_id=advanced_course.id,
                question_text=f"Advanced exam question {i}",
                question_type=QuestionType.TRUE_FALSE,
                options=["True", "False"],
                correct_answer="True",
                is_exam_question=True,
                order=i
            )
            db.add(question)
        
        print(f"✅ Created Advanced course")
        
        # Commit all
        await db.commit()
        print("\n🎉 E-learning data seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_courses())
