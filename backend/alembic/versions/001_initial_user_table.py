"""Initial user table creation

Revision ID: 001
Revises: 
Create Date: 2025-09-09 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """ユーザーテーブル作成"""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, index=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('role', sa.Enum('customer', 'admin', 'staff', name='userrole'), 
                  nullable=False, server_default='customer'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, 
                  server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    
    # インデックスはColumnのindexパラメータで自動作成される


def downgrade() -> None:
    """ユーザーテーブル削除"""
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS userrole')
