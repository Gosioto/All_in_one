"""init

Revision ID: 001
Revises: 
Create Date: 2025-10-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаю enum для статуса задачи
    taskstatus_enum = postgresql.ENUM('pending', 'in_progress', 'done', name='taskstatus')
    taskstatus_enum.create(op.get_bind(), checkfirst=True)
    
    # Создаю таблицу users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    
    # Создаю таблицу tasks
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('status', taskstatus_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Удаляю таблицы
    op.drop_table('tasks')
    op.drop_table('users')
    
    # Удаляю enum
    taskstatus_enum = postgresql.ENUM('pending', 'in_progress', 'done', name='taskstatus')
    taskstatus_enum.drop(op.get_bind(), checkfirst=True)

