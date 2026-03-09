"""Restore danilo@telnyx.com admin user."""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models import User, Organization, Role, UserRole
from app.auth import hash_password
from sqlalchemy import select
import uuid


async def restore_admin():
    """Restore danilo@telnyx.com with admin role."""
    async with AsyncSessionLocal() as db:
        # Get existing organization
        org_result = await db.execute(select(Organization).limit(1))
        org = org_result.scalar_one_or_none()
        
        if not org:
            print("❌ No organization found!")
            return
        
        print(f"✓ Found organization: {org.name} ({org.id})")
        
        # Create roles if they don't exist
        roles_to_create = [
            {"name": "admin", "description": "Administrator with full access"},
            {"name": "manager", "description": "Manager with limited admin rights"},
            {"name": "user", "description": "Regular user"},
        ]
        
        for role_data in roles_to_create:
            role_result = await db.execute(
                select(Role).where(
                    Role.name == role_data["name"],
                    Role.organization_id == org.id
                )
            )
            existing_role = role_result.scalar_one_or_none()
            
            if not existing_role:
                role = Role(
                    name=role_data["name"],
                    description=role_data["description"],
                    organization_id=org.id
                )
                db.add(role)
                print(f"✓ Created role: {role_data['name']}")
        
        await db.commit()
        
        # Get admin role
        admin_role_result = await db.execute(
            select(Role).where(
                Role.name == "admin",
                Role.organization_id == org.id
            )
        )
        admin_role = admin_role_result.scalar_one()
        
        # Check if danilo@telnyx.com exists
        user_result = await db.execute(
            select(User).where(User.email == "danilo@telnyx.com")
        )
        user = user_result.scalar_one_or_none()
        
        if user:
            print(f"✓ User already exists: danilo@telnyx.com")
        else:
            # Create danilo@telnyx.com
            # Using a secure default password - user should change it
            password = "Sipper2026!Admin"
            
            user = User(
                email="danilo@telnyx.com",
                password_hash=hash_password(password),
                full_name="Danilo Smaldone",
                organization_id=org.id,
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"✓ Created user: danilo@telnyx.com")
            print(f"  Password: {password}")
        
        # Assign admin role
        user_role_result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.role_id == admin_role.id
            )
        )
        existing_assignment = user_role_result.scalar_one_or_none()
        
        if not existing_assignment:
            user_role = UserRole(
                user_id=user.id,
                role_id=admin_role.id
            )
            db.add(user_role)
            await db.commit()
            print(f"✓ Assigned admin role to danilo@telnyx.com")
        else:
            print(f"✓ Admin role already assigned")
        
        print("\n✅ DONE")
        print(f"Email: danilo@telnyx.com")
        print(f"Password: Sipper2026!Admin")
        print(f"Role: admin")
        print(f"Organization: {org.name}")


if __name__ == "__main__":
    asyncio.run(restore_admin())
