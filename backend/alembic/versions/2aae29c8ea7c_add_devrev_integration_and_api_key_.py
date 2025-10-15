"""add_devrev_integration_and_api_key_fields_to_users

Revision ID: 2aae29c8ea7c
Revises: fd8991e28a39
Create Date: 2025-10-14 22:11:39.885043

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2aae29c8ea7c'
down_revision = 'fd8991e28a39'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # DevRev Integration fields
    op.add_column('users', sa.Column('devrev_app_id', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('devrev_application_access_token', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('devrev_use_personal_config', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('devrev_revuser_id', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('devrev_session_token', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('devrev_session_expires_at', sa.DateTime(), nullable=True))
    
    # API Key Management fields
    op.add_column('users', sa.Column('api_key', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('api_key_name', sa.String(length=100), nullable=True, server_default='User API Key'))
    op.add_column('users', sa.Column('api_key_created_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('api_key_last_used', sa.DateTime(), nullable=True))
    
    # Create indexes
    op.create_index(op.f('ix_users_devrev_revuser_id'), 'users', ['devrev_revuser_id'], unique=False)
    op.create_index(op.f('ix_users_api_key'), 'users', ['api_key'], unique=True)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_users_api_key'), table_name='users')
    op.drop_index(op.f('ix_users_devrev_revuser_id'), table_name='users')
    
    # Drop API Key Management fields
    op.drop_column('users', 'api_key_last_used')
    op.drop_column('users', 'api_key_created_at')
    op.drop_column('users', 'api_key_name')
    op.drop_column('users', 'api_key')
    
    # Drop DevRev Integration fields
    op.drop_column('users', 'devrev_session_expires_at')
    op.drop_column('users', 'devrev_session_token')
    op.drop_column('users', 'devrev_revuser_id')
    op.drop_column('users', 'devrev_use_personal_config')
    op.drop_column('users', 'devrev_application_access_token')
    op.drop_column('users', 'devrev_app_id')
